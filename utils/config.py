from collections import namedtuple
import yaml

CONFIG_NAME = 'config.yaml'
_config = None

MasterConfig = namedtuple('MasterConfig', 'host port')
MongoConfig = namedtuple('MongoConfig', 'user password host port')
StorageConfig = namedtuple('StorageConfig', 'scheme resources stderr stdout worker')

def __init__():
    global _config
    with open(CONFIG_NAME) as f:
        _config = yaml.safe_load(f)
    print _config


def get_db_config():
    return MongoConfig(
        user=_config['mongodb']['user'],
        password=_config['mongodb']['password'],
        host=_config['mongodb']['host'],
        port=int(_config['mongodb']['port'])
    )

def get_master_config():
    return MasterConfig(
        host=_config['master']['host'],
        port=int(_config['master']['port'])
    )

def get_storage_config():
    return StorageConfig(
        scheme=_config['storage']['scheme'],
        resources=_config['storage']['resources'],
        stderr=_config['storage']['stderr'],
        stdout=_config['storage']['stdout'],
        worker=_config['storage']['worker']
    )

__init__()
