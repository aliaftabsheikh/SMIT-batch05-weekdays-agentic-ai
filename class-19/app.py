# ABSTRACTION IN PYTHON

from abc import ABC, abstractmethod

class BankAbstraction(ABC):
    @abstractmethod
    def deposit(self, amount) -> None:
        pass
    
    @abstractmethod
    def withdraw(self, amount) -> None:
        pass
    
    @abstractmethod
    def get_balance(self) -> int:
        pass
    
    


class BankOne(BankAbstraction):
    def __init__(self, account_number, balance=0):
        self.account_number = account_number
        self.balance = balance
        

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            print(f"Deposited ${amount}. New balance: ${self.balance}")
        else:
            print("Deposit amount must be positive.")

    def withdraw(self, amount):
        if amount > 0:
            if self.balance >= amount:
                self.balance -= amount
                print(f"Withdrew ${amount}. New balance: ${self.balance}")
            else:
                print("Insufficient funds.")
        else:
            print("Withdrawal amount must be positive.")
            
    def get_balance(self):
        return self.balance
    
    @abstractmethod
    def account_type(self) -> str:
        pass

# b1 = BankOne("123456789", 1000)

# b1.deposit(500)

# b1.withdraw(1200)

# print(b1.__dict__)


class SavingAccount(BankOne):
    def account_type(self) -> str:
        return "Saving Account"

s1 = SavingAccount("111222333", 2000)
print(s1.__dict__)
print(s1.account_type())



# class BankTwo(BankAbstraction):
    
#     def __init__(self, account_number, balance=0):
#         self.account_number = account_number
#         self.balance = balance
        
#     def deposit(self,amount):
#         pass
    
#     def withdraw(self, amount):
#         pass
        


# b2 = BankTwo("987654321", 1500)

