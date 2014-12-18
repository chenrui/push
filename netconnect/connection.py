#!/usr/bin/env python
# -*- coding: utf-8 -*-


class Connection(object):
    def __init__(self, conn):
        self.id = conn.transport.sessionno
        self.instance = conn

    def loseConnection(self):
        self.instance.transport.loseConnection()

    def safeToWriteData(self, topicID, msg):
        self.instance.safeToWriteData(msg, topicID)
