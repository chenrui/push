#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.web import vhost, resource
from twisted.internet import reactor
from web.request import DelaySite
from web.error import ErrNo, ErrorPage
from utils import service
from utils.db import db
from utils.logger import log
from distributed.root import BilateralFactory
from .globals import root
from .account_app import AccountApp
from .account_dev import AccountDev


class AccountDispatch(resource.Resource):

    def getChild(self, path, request):
        if path == 'account-app':
            self.putChild('checkmsg', AccountApp('checkmsg'))
            self.putChild('new', AccountApp('new'))
            self.putChild('delete', AccountApp('delete'))
            return resource.getChildForRequest(self, request)
        elif path == 'account-dev':
            self.putChild('register', AccountDev('register'))
            self.putChild('subscribe', AccountDev('subscribe'))
            return resource.getChildForRequest(self, request)
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)


class AccountServer(object):

    @classmethod
    def db_mapping(self, create_tables=False):
        importlib.import_module('account.models')
        db.bind('mysql', host='127.0.0.1', user='root', passwd='root', db='push')
        db.generate_mapping(create_tables=create_tables)

    def __init__(self, addr, port):
        self.webSrv = None
        self.addr = addr
        self.port = port

    def masterapp(self):
        rootservice = service.Service("accountservice")
        root.addServiceChannel(rootservice)
        root.doNodeConnect = _doChildConnect
        root.doNodeLostConnect = _doChildLostConnect
        self.webSrv = vhost.NameVirtualHost()
        self.webSrv.addHost(self.addr, AccountDispatch())
        importlib.import_module('account.command')
        self.db_mapping(True)

    def start(self):
        # reactor.listenTCP(self.root_port, BilateralFactory(root))
        reactor.listenTCP(self.port, DelaySite(self.webSrv))
        reactor.run()


def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(childID):
    pass
