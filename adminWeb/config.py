#!/usr/bin/env python
# -*- coding: utf-8 -*-
import logging
import redis
from datetime import timedelta
from flask.ext.login import LoginManager

project_name = "push_admin"
TIME_ZONE = 'Asia/Shanghai'
login_manager = LoginManager()

rds = redis.StrictRedis(host='localhost', port=6379)


class Config(object):
    # use DEBUG mode?
    DEBUG = True

    # use TESTING mode?
    TESTING = False

    # use server x-sendfile?
    USE_X_SENDFILE = False

    CSRF_ENABLED = True
    # SECRET_KEY = os.urandom(24)
    SECRET_KEY = 'test'

    # LOGGING
    LOGGER_NAME = "%s_log" % project_name
    LOG_FILENAME = "%s.log" % project_name
    LOG_LEVEL = logging.INFO
    # used by logging.Formatter
    LOG_FORMAT = "%(asctime)s %(levelname)s\t: %(message)s"

    PERMANENT_SESSION_LIFETIME = timedelta(days=1)

    # EMAIL CONFIGURATION
    MAIL_SERVER = "localhost"
    MAIL_PORT = 25
    MAIL_USE_TLS = False
    MAIL_USE_SSL = False
    MAIL_DEBUG = False
    MAIL_USERNAME = None
    MAIL_PASSWORD = None
    DEFAULT_MAIL_SENDER = "example@%s.com" % project_name

    # see example/ for reference
    # ex: BLUEPRINTS = ['blog.app']  # where app is a Blueprint instance
    # where app is a Blueprint instance
    # ex: BLUEPRINTS = [('blog.app', {'url_prefix': '/myblog'})]
    BLUEPRINTS = [
                    ('adminWeb.views.profile.app', {'url_prefix': '/admin'}),
                 ]

    # host
    WEB_URL = 'http://101.69.181.82/'
    # static file path
    STATIC_URL = 'http://101.69.181.82/download/'


class Dev(Config):
    DEBUG = True
    MAIL_DEBUG = True
    SQLALCHEMY_ECHO = True


class Testing(Config):
    TESTING = True
    CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = "sqlite:////tmp/%s_test.sqlite" % project_name
    SQLALCHEMY_ECHO = False
