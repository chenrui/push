#!/usr/bin/env python
# -*- coding: utf-8 -*-

import time
from pony.orm import db_session
from utils.logger import logger
from .globals import remote
from .models import Message_X_Device, Message
from .enum import MessageStatus


def serviceHandle(target):
    service = remote.getServiceChannel()
    service.mapTarget(target)


@serviceHandle
def update_msg_status(dids, msg_id, status):
    logger.debug('update status: dids %s msg_id %d to %d' % (dids, msg_id, status))
    with db_session:
        for did in dids:
            m_x_d = Message_X_Device.get(did=did, msg_id=msg_id)
            m_x_d.status = status


@serviceHandle
def getmsg_by_status(did, status):
    now = int(time.time())
    msgs = []
    with db_session:
        sql = "SELECT * from Message_X_Device where did = '%s' and status = %d order by id" % (did, status)
        m_x_d = Message_X_Device.select_by_sql(sql)
        for item in m_x_d:
            msg = Message.get(id=item.msg_id)
            if msg.expires < now:
                item.status = MessageStatus.EXPIRED
            else:
                msgs.append(msg.to_dict(exclude=('expires',)))
    return msgs

