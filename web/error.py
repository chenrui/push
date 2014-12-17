#!/usr/bin/env python
# -*- coding: utf-8 -*-
from twisted.web import http, resource


class ErrNo(object):
    INTERNAL_SERVER_ERROR = 1000
    METHOD_NOT_ALLOWED = 1001
    LESS_PARAMETER = 1002
    INVALID_PARAMETER = 1003
    UNAUTHORIZED = 1004
    NO_RESOURCE = 1005
    DUP_OPERATE = 1006


class Error(object):
    ErrorNoMap = {
                    ErrNo.INTERNAL_SERVER_ERROR: (http.INTERNAL_SERVER_ERROR, "系统内部错误"),
                    ErrNo.METHOD_NOT_ALLOWED: (http.NOT_ALLOWED, "不允许的操作（指定了错误的HTTP方法或API）"),
                    ErrNo.LESS_PARAMETER: (http.BAD_REQUEST, "缺少了必须的参数"),
                    ErrNo.INVALID_PARAMETER: (http.BAD_REQUEST, "参数值不合法"),
                    ErrNo.UNAUTHORIZED: (http.UNAUTHORIZED, "验证失败"),
                    ErrNo.NO_RESOURCE: (http.NOT_FOUND, "请求数据不存在"),
                    ErrNo.DUP_OPERATE: (http.FORBIDDEN, "重复操作"),
                }

    @classmethod
    def getErrorInfo(cls, errno):
        return cls.ErrorNoMap[errno]


class ErrorPage(resource.Resource):
    isLeaf = True

    def __init__(self, errno):
        resource.Resource.__init__(self)
        self.code = errno
        self.status, self.msg = Error.getErrorInfo(errno)

    def render(self, request):
        request.setResponseCode(self.status)
        request.setHeader(b"content-type", b"application/json")
        res = {}
        res['Error_code'] = self.code
        res['Error_msg'] = self.msg
        return res


class SuccessPage(resource.Resource):
    isLeaf = True

    def __init__(self, msg={}):
        if not isinstance(msg, dict):
            raise TypeError("%s not dict" % msg)
        resource.Resource.__init__(self)
        self.msg = msg

    def render(self, request):
        request.setResponseCode(200)
        request.setHeader(b"content-type", b"application/json")
        return self.msg
