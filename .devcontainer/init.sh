### Make git client easier to use

echo Apply Git defaults for tinykb repo...

# Start echo commands
set -x;

# Disable pager to prevent git branch from disappearing after ESC
git config pager.branch false

# Store creds inside container
git config credential.helper store

# Azure DevOps uses http path
git config credential.useHttpPath true

# Use rebase as default merge strategy
git config pull.rebase false

# Stop echo commands
set +x;

### Init Git author identity

# Check if identity exists
git config --get user.name > /dev/null && git config --get user.email > /dev/null
if [ $? -eq 0 ]
then
	GIT_USER_NAME=`git config --get user.name`
	GIT_USER_EMAIL=`git config --get user.email`
	echo "\nWelcome back, $GIT_USER_NAME (email: $GIT_USER_EMAIL)!"
else 
	echo Git author identity does not exist. Start interactive configuration...

	read -p "Your name: " GIT_USER_NAME
	read -p "Your work email: " GIT_USER_EMAIL

	set -x;

	git config user.name "$GIT_USER_NAME"
	git config user.email "$GIT_USER_EMAIL"

	set +x;
fi


