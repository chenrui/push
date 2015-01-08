#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pony.orm import db_session
from utils.logger import logger
from .globals import remote
from .models import Message_X_Device


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
