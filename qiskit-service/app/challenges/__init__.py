#import each category module and runs its @register decorator, adding it to REGISTRY
#new category must be imported here or API won't know it exists
from . import bb84, gate_simplification, normalisation, state_evolution 

from .base import REGISTRY, Challenge, GradeResult