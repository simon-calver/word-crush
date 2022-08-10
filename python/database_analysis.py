import requests
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdate

host = 'https://phaser-host.herokuapp.com'

session = requests.Session()
# session.headers.update({'Authorization': 'JWT ' + 'AYS9-PUH6-UGO6-LBG5-SLS2'})

# put_response = session.post("{}/post-word-score".format(host), json={"user": 123, "score": 1_000, "recordedTime": 0})

get_response = session.get('{}/get-word-scores'.format(host))#, params={'user': '90.194.135.104'})

scores = pd.DataFrame(get_response.json())
scores['datetime'] = pd.to_datetime(1_000_000*scores['recordedTime']).dt.tz_localize('UTC').dt.tz_convert('GB')
scores['day'] = pd.to_datetime(1_000_000*scores['recordedTime']).dt.date

today = pd.to_datetime('today').normalize()

todays_scores = scores[scores['day'] == today]

print(todays_scores.groupby('user').agg({'score': ['mean', 'count'], 'datetime': 'max'}))
print('\nTotal games played today: {} \ntotal players today: {}'.format(len(todays_scores['user']), len(todays_scores['user'].unique())))

sq_scores = scores[scores['user'].str.contains('SQ')]
sq_scores_per_day = sq_scores.groupby('day').agg(users=('user', 'unique'), games=('user', 'count'), recorded_time=('recordedTime', 'min')).reset_index()
sq_scores_per_day['player_count'] = sq_scores_per_day['users'].map(len)

# Insert missing days
all_days = pd.date_range(sq_scores_per_day['day'].iloc[0], today).to_pydatetime()
all_days = [day.date() for day in all_days]

missing_days = list(set(all_days) - set(sq_scores_per_day['day']))
missing_days_df = pd.DataFrame({
    'day': missing_days, 
    'users': len(missing_days)*[[]], 
    'games': len(missing_days)*[0], 
    'recorded_time': len(missing_days)*[0], 
    'player_count': len(missing_days)*[0]
})

sq_scores_per_day = sq_scores_per_day.append(missing_days_df)
sq_scores_per_day.sort_values(by=['day'], inplace=True)
sq_scores_per_day.reset_index(drop=True, inplace=True)

fig, ax = plt.subplots(figsize=(8, 6))
ax2 = ax.twinx()

mdate_time = mdate.date2num(sq_scores_per_day['day']) #  epoch2num(sq_scores_per_day['recorded_time'] // 1_000)

l1 = ax2.plot_date(mdate_time, sq_scores_per_day['games'], '-', color='k', label='games played')
l2 = ax.plot_date(mdate_time, sq_scores_per_day['player_count'], '-', color='r', label='unique players')

ax2.set_ylabel('games played')
ax.set_ylabel('unique players')
           
ax.set_ylim(bottom=0)
ax2.set_ylim(bottom=0)

ax.tick_params('y', colors='tab:red')

ax.legend(handles=l1+l2)

ax.grid(True)
fig.autofmt_xdate()

# All time top 20
df = scores[(scores['user'].str.contains('SQ')) & (scores['recordedTime'] > 0)].nlargest(20, columns=['score'])[['user', 'score', 'datetime']].reset_index(drop=True)
pd.set_option('display.colheader_justify', 'left')
print('\nAll time top 20:\n', df)
