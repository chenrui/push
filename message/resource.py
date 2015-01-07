#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import time
from twisted.web import resource
from pony.orm import db_session
from web.error import ErrorPage, ErrNo, SuccessPage
from .models import Message, Message_X_Device
from .enum import MessageStatus as MsgStatus
from .globals import remote
from utils.logger import log


class MessageStorage(resource.Resource):

    def render_POST(self, request):
        data = request.content.getvalue()
        return self.storage(json.loads(data))

    def storage(self, data):
        if not self.parse_audience(data['audience']):
            return ErrorPage(ErrNo.NO_MATCHED_OBJ)

        msg = self.parse_nofification(data['notification'], data.get('options', None))
        # TODO: async
        self.send_to_router(data['audience'], msg)
        return SuccessPage(msg.to_dict(exclude=('title', 'body', 'expires')))

    def _sendto(self, dids, msg):
        with db_session:
            for did in dids:
                Message_X_Device(did=did, msg_id=msg.id, status=MsgStatus.NOT_SEND)
        remote.callRemote('push', dids, msg.to_dict())

    def send_to_router(self, audience, msg):
        if 'device_id' in audience:
            dids = audience['device_id']
            dids = [dids] if isinstance(dids, unicode) else dids
            self._sendto(dids, msg)
            return
        elif audience == 'all':
            # TODO: get all dids
            handle = None
            pass
        elif 'tag' in audience:
            # TODO: get dids in this tag
            handle = None
            pass

        page = 1
        page_size = 100
        while True:
            dids = handle(page=page, size=page_size)
            self._sendto(dids, msg)
            if len(dids) < page_size:
                break
            page += 1

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

    def parse_nofification(self, notification, options):
        current_time = int(time.time())
        title = notification['title']
        body = notification['body']
        if options:
            sendno = options.get('sendno', 0)
            expires = options.get('expires', 86400) + current_time
        else:
            sendno = 0
            expires = current_time + 86400
        with db_session:
            return Message(sendno=sendno, title=title, body=body, expires=expires)


class MessageStatus(resource.Resource):
    pass
