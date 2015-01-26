#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import time
from twisted.web import resource
from twisted.internet import threads
from pony.orm import db_session
from account.client_async import AccountClient
from web.error import ErrorPage, ErrNo, SuccessPage
from utils.logger import logger
from .models import Message
from .cache import MessageCache
from . import config


class MessageStorage(resource.Resource):

    def __init__(self):
        self.account = AccountClient(config['ACCOUNT_ADDR'])
        self.msgCache = MessageCache.getInstance(**config['REDIS'])
        resource.Resource.__init__(self)

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.storage(json.loads(data))

    def storage(self, data):
        if not self.parse_audience(data['audience']):
            logger.info('audience %s not found' % data['audience'])
            return ErrorPage(ErrNo.NO_MATCHED_OBJ)
        msg = self.parse_nofification(data['app_key'], data['notification'], data.get('options', None))
        # send msg async
        threads.deferToThread(self.send_to_router, data['audience'], msg)
        return SuccessPage(msg.to_dict(exclude=('app_key', 'generator', 'title', 'body', 'expires')))

    def _sendto(self, dids, message):
        msg = message.to_dict()
        for did in dids:
            self.msgCache.add(did, msg)

    def send_to_router(self, audience, msg):
        if 'device_id' in audience:
            dids = audience['device_id']
            dids = [dids] if isinstance(dids, unicode) else dids
            self._sendto(dids, msg)
            return
        elif audience == 'all':
            handle = self.account.getDevices
        elif 'tag' in audience:
            # TODO: get dids in this tag
            handle = None
            return

        page = 1
        page_size = 100
        def callback(data, defer, page, page_size):
            if 'Error_code' in data:
                logger.error('get audience %s error(%d, %s)' % (audience,
                                                                data['Error_code'],
                                                                data['Error_msg']))
            else:
                dids = data['dids']
                self._sendto(dids, msg)
                if len(dids) == page_size:
                    defer.addCallback(callback, defer, page + 1, page_size)

        d = handle(page, page_size)
        d.addCallback(callback, d, page, page_size)

    def parse_audience(self, audience):
        if audience == 'all':
            return True
        if 'tag' in audience:
            # get tag did number
            num = 0
            # num = get_tag_number(audience['tag'])
            return num != 0
        elif 'device_id' in audience:
            dids = audience['device_id']
            return len(dids) != 0
        else:
            return False

    def parse_nofification(self, app_key, notification, options):
        current_time = int(time.time())
        title = notification['title']
        body = notification['body']
        if options:
            sendno = options.get('sendno', 0)
            expires = options.get('expires', 86400) + current_time
            generator = options.get('generator', '')
        else:
            sendno = 0
            expires = current_time + 86400
            generator = ''
        with db_session:
            return Message(sendno=sendno, app_key=app_key, generator=generator,
                           title=title, body=body, expires=expires, timestamp=current_time)


class MessageStatus(resource.Resource):
    pass
