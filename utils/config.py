#!/usr/bin/env python
# -*- coding: utf-8 -*-

class Config(dict):
    def from_object(self, obj):
        for key in dir(obj):
            if key.isupper():
                self[key] = getattr(obj, key)

