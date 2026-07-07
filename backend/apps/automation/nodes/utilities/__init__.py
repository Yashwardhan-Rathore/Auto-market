from .wait import WaitNode


UTILITY_REGISTRY = {
    "WAIT": WaitNode(),
    "DELAY": WaitNode(),
}
