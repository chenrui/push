#!/usr/bin/env python
# -*- coding: utf-8 -*-

import importlib
from twisted.application import internet
from twisted.web import resource
from twisted.internet import task
from web.request import DelaySite
from utils.db import db
from web.error import ErrorPage, ErrNo
from utils import service
from .resource import MessageStorage, MessageStatus
from .cache import MessageCache
from . import config, remote


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

    def __init__(self, config_obj):
        config.from_object(config_obj)

    def get_service(self):
        addr, port = config['MESSAGE_ADDR']
        return internet.TCPServer(port, DelaySite(Dispatch()), interface=addr)

    def configure(self):
        self.config_cache()
        self.config_database(True)
        self.config_remote()
        self.config_task()

    def config_remote(self):
        msgservice = service.Service("MessageServer")
        remote.addServiceChannel(msgservice)
        importlib.import_module('message.command')
        remote.setName(config['NODENAME'])
        remote.connect(config['ROUTER_ADDR'])

    def config_database(self, create_tables=False):
        importlib.import_module('message.models')
        if config.get('BINDDB', True):
            db_config = config['DATABASE']
            db.bind(db_config['ENGINE'], host=db_config['HOST'], user=db_config['USER'],
                    passwd=db_config['PASSWORD'], db=db_config['NAME'])
            db.generate_mapping(create_tables=create_tables)

    def config_cache(self):
        kwargs = config['REDIS']
        cache = MessageCache.getInstance(**kwargs)

    def config_task(self):
        from .tasks import check_acking_queue, check_dead_queue, send_to_router
        t = task.LoopingCall(send_to_router)
        t.start(1)
        t = task.LoopingCall(check_dead_queue)
        t.start(60 * 10)
        t = task.LoopingCall(check_acking_queue)
        t.start(30)
