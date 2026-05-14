# def multiple_numbers(a, b , *num):
#     print(num)
    

# multiple_numbers(1, 2, 3, 4, 5)
# multiple_numbers(10, 20, 30)
# multiple_numbers(100, 200)


# def multiple_numbers_with_list(a, b, *num):
#     print(a)
#     print(b)
#     # for num in num:
#     #     print(num)
    
    
    
# multiple_numbers_with_list(*[1])


# def posFun(x, y, /, z):
#     print(x + y + z)


# posFun(1,2, 3)


# def posFun( x, /, y, *, z):
#     print(x + y + z)


# posFun(1, 2, z=3)




# def add():  # function definition / statement / declaration
#     a = 10
#     b = 20
    
#     sum = a + b
    
#     return sum
    

# result = add()   # function calling / invocation
# print(result)


# One liner code using lambda function
# my_lambda = lambda x, y:  x + y;



# print(my_lambda(10, 20) )


# total = 0; 

# def sum( arg1, arg2 ):
#    total = arg1 + arg2; 
#    print ("Inside the function local total : ", total)
#    return total;

# sum( 10, 20 );

# print ("Outside the function global total : ", total)




def my_func(**args):
    for key, value in args.items():
        print(f"{key}: {value}")


my_func(name="John", age=20, city="New York", country="USA")    
    
    