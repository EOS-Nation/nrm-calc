# nrm-calc
NRM prices calculator

https://eos-nation.github.io/nrm-calc/

## Usage

Pick how much you want to rent (0.00001%-100%) and set desired model parameters.
So to rent 0.1% of network capacity (34 seconds of CPU) for 24H when network is utilized at 30% (current CPU utilization) you need to pay ~20 EOS.

Here's how it compares to current REX/staking model:
To get 0.1% of network capacity (~34 seconds of CPU) you need to stake ~360K EOS. To rent that much on REX for 30 days at current rate you'd pay 3.6 EOS per 1 day (figures from last Friday).

For perspective, historically, REX prices have been fluctuating between 1.8 EOS and 12 EOS per 0.1% per 24H, depending on the CPU market.

You can tweak the parameters (exponent, min_price, max_price) to get the desired curve shape.
