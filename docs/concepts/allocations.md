# Basis Points and Rounding

Each beneficiary receives an allocation in basis points: 100 basis points equals 1%, and all allocations must sum to 10,000. Fanout uses integer arithmetic. When division leaves base units, the contract assigns them by largest remainder so the payouts always sum exactly to the payment amount.
