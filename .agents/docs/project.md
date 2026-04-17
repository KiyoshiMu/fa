Existing tools: [https://www.canada.ca/en/services/finance/tools.html](https://www.canada.ca/en/services/finance/tools.html)   
**Step 1: Create a cash flow statement**   
formula: Net cash flow \= cash inflows \- cash outflows  
Want visualized results \- a list of cash inflow and cash outflow, a conclusion on whether it is positive cash flow or negative, a pie chart with percentages showing spending in different categories   
![][image1]

**In a situation where the user has negative cash flow, direct-to-cash-flow analysis instead of going to Step 2(where can the user save extra money?)**  
list: 

- inflow: $$$  
- separate outflow into: fixed expenses and variable expenses  
  (fixed expenses: loan payments, rent, insurance, bills, mortgages, strata fees; variable expenses: entertainment related)   
- The recommendation can be: reduce a certain percentage of variable expenses   
  (budgeting basics: follow 50-30-20 rules \- 50% for Needs (essentials), 30% for Wants (discretionary spending), and 20% for Savings/Debt Repayment)  
  existing budgeting tool to reference on: [https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/budget-planner](https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/budget-planner) 

Final result: Create a visualized list to make the cash flow positive (or equal 0 at the very minimum) 

**Step 2: Identify Goals**  
Question: What are you saving for? (multiple choice \- only allow to pick one)  
Home  
Vacation  
Debt Consolidation  
Other (give option to input specific amount) 

**Step 3: Based on the goals selected above, the situation varies**  
e.g., if Home is selected  
**Data collection: \- Questionnaire**   
**General Question to start with:**   
How much do you need for a down payment? (in dollars)   
How much have you saved for a down payment?   
Do you have a First Home Saving Account?   
How much have you contributed to a Registered Retirement Savings Plan? 

**Part 1:**  
![][image2]  
Note: Change the question to: When do you plan to buy your home? 

![][image3]  
![][image4]  
**Part 2:**  
![][image5]  
![][image6]  
![][image7]  
![][image8]![][image9]  
Note: automatically calculate score for questions 4 to 9

**Part 3:**  
![][image10]  
![][image11]  
![][image12]  
![][image13]  
Note: automatically calculate score for questions 10 to 15

Final result table to determine risk appetite:  
![][image14]  
**Result wanted for Risk Appetite questionnaire (parts 1, 2, and 3):** automatically generate investment profile (Safety, Very Conservative, Conservative, Moderate, Aggressive, Very Aggressive)  
Note: We don't really need to show the “points” behind the options, but use them as internal calculations to generate the investment profile  
Parts 1, 2, and 3 combined are called the Investment Profile Questionnaire; needs it for “Home”, “Vacation”, and “Other (specific amount)”; the first question under Part 1 can be changed based on which goal the user selected, and keeps the remaining the same. 

Next step under “Home”  
**(NOTE: if the user selects “NO” on the question \- Do you have an FHSA? \- automatically recommend setting up an FHSA)**  
Based on the cashflow analysis from Step 1, data gathered from general questions in Step 2 (current savings, how much is needed for down payment, when do you plan to buy \- question 1 part 1, and investment profile), provide recommendations on: 

1) whether or not extra cash needs to be saved \- mainly from cash flow analysis 

![][image15]assuming r \= 0, for just putting extra cash aside for “the goal”  
**If extra cash is needed, display how much extra is needed**

2) Based on the investment profile, direct to different options to highlight either a shorter timeline or a lower PMT with the help of investments  
   Safety: r \= 2%  
   Very Conservative: r \= 3%  
   Conservative: r \= 4%  
   Moderate: r \= 5%  
   Aggressive: r \= 7%  
   Very Aggressive: r \= 9%  
     
   **disclaimer (recommend to add):** The rates of return shown are for illustrative purposes only and are not guaranteed. Actual results will vary based on market conditions and individual circumstances.  
     
   **Visualized result wanted:** a bar chart (or anything that fits) to highlight either the PMT difference between 1\) and 2\) with the same n, or the difference in “n” between 1\) and 2\) with the same PMT

**Step 4: Based on the Investment Profile \- recommend solutions**  
(This step can have two solutions \- 1\) directly recommend 2 ETFs or mutual funds based on the investment profile (Safety \- Very aggressive); 2\) recommend an advisor

Sherry’s thought \- I’d recommend having both options and separate them into two versions \- if the software is sold to the company/advisors, it can link to option 2\) if the software is used by individual users (with subscription etc.) \- lead to option 1), and later on can add functions such as ongoing review, portfolio rebalancing etc. 

**The same flow applies to “vacation” and “other.”**  
**Only a change in general questions:**   
How much do you need to save? (in dollars)   
How much have you already saved?  
Do you have a Tax-Free Savings Account?   
How much have you contributed to the Tax-Free Savings Account?   
**Debt consolidation is another topic that can develop later (maybe take out for the current stage).** 
