# From my computer, call into server to sync online version
upload:
	ssh -p 7822 185.146.28.139 "cd /var/www/html/clab_vr_cube; git pull"

stashup:
	ssh -p 7822 185.146.28.139 "cd /var/www/html/clab_vr_cube; git stash; git pull"

xdiff:
	ssh -p 7822 185.146.28.139 "cd /var/www/html/clab_vr_cube; git diff"

ignore:
	#ssh -p 7822 185.146.28.139 "cd /var/www/html/remote2020; git checkout -- client/applets/adaptoy2.html"
	ssh -p 7822 185.146.28.139 "cd /var/www/html/remote2020; rm -v client/summation*"
