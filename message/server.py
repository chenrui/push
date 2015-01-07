#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.web import vhost, resource
from twisted.internet import reactor
from web.request import DelaySite
from utils.db import db
from web.error import ErrorPage, ErrNo
from utils import service
from .globals import remote
from .resource import MessageStorage, MessageStatus


class Dispatch(resource.Resource):

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
        msgservice = service.Service("msgservice")
        remote.addServiceChannel(msgservice)
        remote.setName('message-server')
        importlib.import_module('message.command')
        remote.connect(self.remote_addr)

    def config_msg_server(self):
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost(self.addr, Dispatch())
        self.db_mapping(True)

    def _do_start(self):
        self.config_msg_server()
        self.config_remote()
        reactor.listenTCP(self.port, DelaySite(self.webSrv))

    def start(self):
        self._do_start()
        reactor.run()
