#!/usr/bin/env python
# -*- coding: utf-8 -*-

from utils.logger import logger
from .connection import Connection


class ConnectionManager(object):
    def __init__(self):
        self.connects = {}

    def addConnection(self, conn):
        _conn = Connection(conn)
        if _conn.id in self.connects:
            raise KeyError
        self.connects[_conn.id] = _conn
        return _conn.id

    def dropConnectionByID(self, connID):
        try:
            del self.connects[connID]
        except Exception, e:
            logger.error(e)

    def getConnectionByID(self, connID):
        return self.connects.get(connID, None)

    def loseConnection(self, connID):
        conn = self.getConnectionByID(connID)
        if conn:
            conn.loseConnection()

    def pushObject(self, cmdID, msg, sendList):
        for target in sendList:
            try:
                conn = self.getConnectionByID(target)
                if conn:
                    conn.safeToWriteData(cmdID, msg)
            except Exception,e:
                logger.error(e)
