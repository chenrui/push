#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from twisted.internet import reactor
from twisted.internet.protocol import Protocol
from twisted.web.iweb import IBodyProducer
from twisted.internet import defer
from twisted.web.client import Agent
from twisted.web.http_headers import Headers
from zope.interface import implements
from twisted.internet.defer import succeed

class StringProducer(object):
    implements(IBodyProducer)

    def __init__(self, body):
        self.body = body
        self.length = len(body)

    def startProducing(self, consumer):
        consumer.write(self.body)
        return succeed(None)

    def pauseProducing(self):
        pass

    def stopProducing(self):
        pass


class Receiver(Protocol):
    def __init__(self, defer):
        self.buf = ''
        self.defer = defer

    def dataReceived(self, data):
        self.buf += data

    def connectionLost(self, reason):
        self.defer.callback(self.buf)


def httpRequest(url, method, values={}, headers={}):
    agent = Agent(reactor)
    data = json.dumps(values)

    d = agent.request(method,
                      url,
                      Headers(headers),
                      StringProducer(data) if data else None)

    def handle_response(response):
        d = defer.Deferred()
        response.deliverBody(Receiver(d))
        return d

    def process_data(data):
        data = json.loads(data)
        return data

    d.addCallback(handle_response)
    d.addCallback(process_data)
    return d
