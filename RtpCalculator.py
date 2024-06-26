import numpy as np

# 주어진 정보
symbols = ['cherries', 'bell', 'bar', 'seven', 'diamond']
payouts = [5, 10, 20, 30, 77]  # 배수
probabilities = [6/20, 5/20, 4/20, 3/20, 2/20]  # 확률

prob_cherry_one = (probabilities[0]) * (1 - (probabilities[0])**2)
print(sum(probabilities))

# 각 심볼의 기대값 계산
expected_values = [(prob ** 3) * payout for prob, payout in zip(probabilities, payouts)]
expected_values.append(prob_cherry_one)

# RTP 계산
rtp = sum(expected_values)
rtp_percentage = rtp * 100

# 결과 출력
print(f"RTP: {rtp_percentage:.2f}%") # 90.25
