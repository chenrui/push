#!/usr/bin/env python
# -*- coding: utf-8 -*-

from distributed.root import PBRoot

root = PBRoot()


class RetNo(object):
    FAILD = 0
    SUCCESS = 1
    EXISTED = 2
