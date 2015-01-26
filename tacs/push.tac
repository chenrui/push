#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.config import Config
from config.globals import BaseConfig
from utils.logger import set_logger
config = Config()
config.from_object(BaseConfig)
set_logger(config['LOGLEVEL'])

from twisted.application import service
from tp_gateway.server import TPServer
from account.server import AccountServer
from dev_gateway.server import DevServer
from message.server import MessageServer
from router.server import RouterServer
from config.configs import AccountConfig, DevConfig, MessageConfig, RouterConfig, ThirdPartConfig
from utils.db import db


application = service.Application("Push Application")

tp = TPServer(ThirdPartConfig)
tp.configure()
tp.get_service().setServiceParent(application)

router = RouterServer(RouterConfig)
router.configure()
router.get_service().setServiceParent(application)

dev = DevServer(DevConfig)
dev.configure()
dev.get_service().setServiceParent(application)

account = AccountServer(AccountConfig)
account.configure()
account.get_service().setServiceParent(application)


msg = MessageServer(MessageConfig)
msg.configure()
msg.get_service().setServiceParent(application)


db_config = config['DATABASE']
db.bind(db_config['ENGINE'], host=db_config['HOST'], user=db_config['USER'],
                                        passwd=db_config['PASSWORD'], db=db_config['NAME'])
db.generate_mapping(create_tables=True)
