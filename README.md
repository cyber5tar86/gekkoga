# gekkoga + Web UI
Genetic Algorithm for solving optimisation of trading strategies using Gekko

This is a quick and dirty UI layer built on top of https://github.com/gekkowarez/gekkoga.

I've tried to tamper with the original code as little as possible while still allowing it to be used directly through the command line.
The results shown here are stored separately from the original gekkoga data and currently stores the top 50 results for each strategy - all in the same manner as the original gekkoga.

## Installation
    node >= 7.x.x required!
1) git clone https://github.com/gekkowarez/gekkoga.git
2) cd gekkoga
3) npm install
4) cp config/sample-config.js config/your-config.js
5) modify your-config.js make sure you have data for currency/asset pair and the daterange
6) node run.js -c config/your-config.js

## UI
$ node server.js rather than the command above.

Click the COPY button to copy the toml settings to the clipboard to quickly run in Gekkos UI.

![UI preview](http://i.imgur.com/s2VDwbv.png)


#### tmux usage:
1) sudo apt-get install tmux
2) tmux new -s gekkoga
3) go to the web folder in your gekko installation (gekko/web)
4) node –max-old-space-size=8192 server.js (for macos: --max_old_space_size=8192)
5) hold CTRL and press b, then press % (to split the screen)
6) goto your gekkoga clone directory
7) node run.js -c config/your-config.js
8) hold CTRL and press b, then hit d (to detach and run in the background)
9) tmux attach -t gekkoga (to reattach and bring gekkoga to foreground)
