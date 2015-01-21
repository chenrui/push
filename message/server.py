#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.web import vhost, resource
from twisted.internet import task
from twisted.internet import reactor
from distributed.remote import RemoteObject
from web.request import DelaySite
from utils.db import db
from web.error import ErrorPage, ErrNo
from utils import service
from utils.logger import set_logger, logging
from .resource import MessageStorage, MessageStatus
from .cache import MessageCache


class Dispatch(resource.Resource):
    def __init__(self):
        resource.Resource.__init__(self)

    def getChild(self, path, request):
        if path == '':
            return self
        elif path == 'storage':
            return MessageStorage()
        elif path == 'message':
            return MessageStatus()
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)

    def render(self, request):
        return ErrorPage(ErrNo.LESS_PARAMETER)


class MessageServer(object):

    @classmethod
    def db_mapping(self, create_tables=False):
        db.bind('mysql', host='127.0.0.1', user='root', passwd='root', db='push')
        db.generate_mapping(create_tables=create_tables)

    def __init__(self, addr, port, remote_addr):
        self.webSrv = None
        self.addr = addr
        self.port = port
        self.remote_addr = remote_addr

    def config_remote(self):
        remote = RemoteObject.getInstance('message-server')
        msgservice = service.Service("msgservice")
        remote.addServiceChannel(msgservice)
        importlib.import_module('message.command')
        remote.connect(self.remote_addr)

    def config_msg_server(self):
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost(self.addr, Dispatch())
        self.db_mapping(True)

    def config_cache(self):
        kwargs = {}
        cache = MessageCache.getInstance(**kwargs)

    def config_task(self):
        from .tasks import check_acking_queue, check_dead_queue, send_to_router
        t = task.LoopingCall(send_to_router)
        t.start(1)
        t = task.LoopingCall(check_dead_queue)
        t.start(60 * 10)
        t = task.LoopingCall(check_acking_queue)
        t.start(30)

    def _do_start(self):
        set_logger(logging.DEBUG)
        self.config_remote()
        self.config_cache()
        self.config_task()
        self.config_msg_server()
        reactor.listenTCP(self.port, DelaySite(self.webSrv))

    def start(self):
        self._do_start()
        reactor.run()
