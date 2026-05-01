2nd revise   
1\)  
@revision plan\images\image1.png
change “target amount” to questions: 

1. What type of properties do you want to purchase?   
- condo   
- townhouse  
- semi-detached   
- single family  
2. What is the percentage you want to save as a down payment? 

	（加解释）

- 5% (CMHC insured) (add a small question mark on the top right corner after “insured”, if the user hovers over, shows details (details vary based on the answer selected from question 1 \+ the median of different property types): e.g. if question one is selected as condo, with median less than $500,000, the detail shall show: insurance premium up to $21375 est, calculated as: 500K \* 95% \* 4.5%.)  
- (Need help with the percentage for this option: for median between 500K to 1.5MM, the minimum DP required is 5%\**500K+10%*\*the remaining amount; insurance premium will vary from 2.8% \*  mortgage amount \~ 4.5% \* mortgage number, based on the calculation: 5%\**500K+10%*\*the remaining amount, what will be the percentage shown for this option??)  
- 20%（recommend）  
- 35% or more, specify number\_\_\_\_

Based on the answer to the above questions, calculate the “target amount.”   
Note: (need to make sure it updates quarterly) median for different property types \- [https://creastats.crea.ca/mls/treb-median-price](https://creastats.crea.ca/mls/treb-median-price)  
CMHC insurance premium reference:   
(Loan-to-value calculated as purchase price (100%) \- down payment (%), if DP greater than 20%, CMHC not required.)  
@revision plan\images\image2.png 
CMHC policy reference: [https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers/what-is-mortgage-loan-insurance](https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers/what-is-mortgage-loan-insurance)  
[https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers/cmhc-mortgage-loan-insurance-cost](https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers/cmhc-mortgage-loan-insurance-cost)

2\) Risk Profiler \- 11 questions in total for now  
Q1 \- link to “time horizon” under step 2 “goals”, and remove from Risk profiler; keep the points for this question and calculate it behind the scenes   
Q4 \- annual income \- link to step one “cash flow”: can be calculated roughly; if user is getting paid bi-weekly: formula is $$$ \* 26 \* tax bracket / monthly: $$$ \* 12 \* tax bracket / semi-monthly: $$$ \* 24 \* tax bracket   
tax bracket reference: [https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html](https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html)   
(I do recommend keeping the question and letting the user choose from the options \- for accuracy purposes)   
Q5 \- income stability: link to Step 1 \- cash flow, analyze payment/salary frequency. If the user is getting paid with a fixed frequency (bi-weekly, weekly, monthly), then automatically confirm income stability as “very stable”; otherwise, categorize income as “unstable”; remove the question, but calculate the points behind the scene   
Q8 \- automatically calculate the % based on Q7 “net worth” and “target amount” from step 2 \- goals; remove the question, but calculate the points behind the scene  
**UX: 五边形图 （类似这样？ created by ChatGPT)**  
@revision plan\images\image3.png 

3\)   

@revision plan\images\image4.png  
Add a time bar on the above page for the user to adjust the time   
Recommendations:   
Principle: FHSA annual contribution limit is $4000, lifetime contribution limit is $50,000, maximum contribution year is 5 years  
RRSP Home Buyers' Plan: maximum withdrawal (tax-free for DP is $35,000)   
In a situation where the user wants to utilize both HBP from RSP and FHSA, they will be able to purchase a property in 5 years.   
RRSP contribution limit calculation: 18% of the previous year’s earned income (use 18% of annual salary for calculation purposes)   
Step 1:   
If the user selected “No” under “FHSA”: show recommendation to invest the “with investment” amount into FHSA.   
If the user selected “yes” under FHSA, and inputted $$ amount in the box, calculate and show the recommendation to invest the additional amount into FHSA  
Note: monthly maximum can contribute to FHSA: $333, I would prob show a recommendation of semi-monthly of $153, and a graph to illustrate the total savings under FHSA in 5 years (with the selected return rate from step 3\)   
If the monthly contribution is greater than $333, show a recommendation to contribute the remaining to RRSP; (make sure to roughly calculate the annual RRSP contribution limit by: 18% \* annual income)   
If there are still excessive contributions, the recommendation will be in the TFSA 

Desired outcome (used screenshot from point 3 / $1056 as example, bi-weekly calculated as $1056 \* 12 / 26):   
@revision plan\images\image5.png 
Note: bi-weekly frequency is recommended, as most of the company is bi-weekly payment frequency. Or if possible, we can also show three results: **bi-weekly, semi-monthly, and monthly**  
Need to either analyze the frequency from the bank statements uploaded from step 1, or if use decided to input the information manually, add a question to ask for the frequency of pay, then display the result from the recommendation step accordingly.   
**UX hint: “pay yourself first” mentality** 
