from enum import Enum

class UserRole(str, Enum):
    user = "user"
    admin_system = "admin_system"
    admin_hardware = "admin_hardware"
    admin_software = "admin_software"
    admin_network = "admin_network"
    admin_security = "admin_security"

class UserSector(str, Enum):
    Hardware = "Hardware"
    Software = "Software"
    Network = "Network"
    Security = "Security"
