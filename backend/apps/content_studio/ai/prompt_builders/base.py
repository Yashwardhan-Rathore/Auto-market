from abc import ABC, abstractmethod

class BasePromptBuilder(ABC):
    """
    Abstract base class for all prompt builders.
    Enforces a standardized interface to build prompts.
    """
    
    @abstractmethod
    def build(self, **kwargs) -> str:
        """
        Constructs and returns the final prompt string.
        """
        pass
