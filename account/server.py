#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.application import internet
from twisted.web import resource
from web.request import DelaySite
from web.error import ErrNo, ErrorPage
from utils import service
from utils.db import db
from utils.logger import set_logger, logging
from . import pbroot, config
from .account_app import AccountApp
from .account_dev import AccountDev
from .account_profile import AccountProfile


class AccountDispatch(resource.Resource):

    def getChild(self, path, request):
        if path == 'account-app':
            self.putChild('checkmsg', AccountApp('checkmsg'))
            self.putChild('new', AccountApp('new'))
            self.putChild('find', AccountApp('find'))
            self.putChild('delete', AccountApp('delete'))
            return resource.getChildForRequest(self, request)
        elif path == 'account-profile':
            self.putChild('new', AccountProfile('new'))
            self.putChild('find', AccountProfile('find'))
            return resource.getChildForRequest(self, request)
        elif path == 'account-dev':
            self.putChild('register', AccountDev('register'))
            self.putChild('subscribe', AccountDev('subscribe'))
            self.putChild('device_ids', AccountDev('device_ids'))
            return resource.getChildForRequest(self, request)
        else:
            return ErrorPage(ErrNo.NO_RESOURCE)


class AccountServer(object):

    def __init__(self, config_obj):
        config.from_object(config_obj)

    def configure(self):
        self.config_logger()
        self.config_pbroot()
        self.config_database(True)

    def get_service(self):
        addr, port = config['ACCOUNT_ADDR']
        return internet.TCPServer(port, DelaySite(AccountDispatch()), interface=addr)

    def config_logger(self):
        set_logger(config.get('LOGLEVEL', logging.INFO))

    def config_pbroot(self):
        rootservice = service.Service('AccountServer')
        pbroot.addServiceChannel(rootservice)
        pbroot.doNodeConnect = _doChildConnect
        pbroot.doNodeLostConnect = _doChildLostConnect
        importlib.import_module('account.command')

    def config_database(self, create_tables=False):
        importlib.import_module('account.models')
        if config.get('BINDDB', True):
            db_config = config['DATABASE']
            db.bind(db_config['ENGINE'], host=db_config['HOST'], user=db_config['USER'],
                    passwd=db_config['PASSWORD'], db=db_config['NAME'])
            db.generate_mapping(create_tables=create_tables)


def _doChildConnect(name, transport):
    pass


def _doChildLostConnect(childID):
    pass
