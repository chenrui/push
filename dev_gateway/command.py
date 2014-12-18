#!/usr/bin/env python
# -*- coding: utf-8 -*-

from .globals import factory


def serviceHandle(target):
    service = factory.getServiceChannel()
    service.mapTarget(target)



