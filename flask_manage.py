#!/usr/bin/env python
# -*- coding:utf-8 -*-
from flask.ext import script
from adminWeb.main import app_factory
from adminWeb import config

if __name__ == "__main__":
    server = script.Server(host='0.0.0.0', port=7700)
    manager = script.Manager(app_factory)
    manager.add_command("runserver", server)
    manager.add_option("-c", "--config", dest="config", required=False,
                       default=config.Dev)
    manager.run()
else:
    app = app_factory(config=config.Config)
