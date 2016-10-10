#!/bin/bash


#------------------------------------Paths used in the script-----------------------------------------------#

SCRIPTS_PATH=$(pwd)

#-----------------------------------------------------------------------------------------------------------#

#----------------------------------------------------------------------------------------------------------#


#------------------------------------Obtains the IPV4 address----------------------------------------------#
function getIP
{
	MACHINE_IP=$(ip route get 1 | awk '{print $NF;exit}')
	echo "http://$MACHINE_IP"
}

#----------------------------------------------------------------------------------------------------------#



#-----------------------------------Obtains the port values------------------------------------------------#
function setPorts
{
	INC=$(cat $SCRIPTS_PATH/data.txt) #Reads the increment value
	CHE_PORT=$(expr 8080 + $INC) #New Che port
	echo $(expr $INC + 1) > $SCRIPTS_PATH/data.txt
}

#----------------------------------------------------------------------------------------------------------#

#----------------------------------------------------------------------------------------------------------#
#Docker function made based on gist made by Erik Kristensen found on https://gist.github.com/ekristen/11254304#
#-------------------------------------------------------------------------------------#
# ----------------Author: Erik Kristensen                                             #
# ----------------Email: erik@erikkristensen.com                                      #
# ----------------License: MIT                                                        #
# ----------------Nagios Usage: check_nrpe!check_docker_container!_container_id_      #
# ----------------Usage: ./check_docker_container.sh _container_id_                   #
#                                                                                     #
# ----------------The script checks if a container is running.                        #
# ----------------  OK - running                                                      #
# ----------------  WARNING - container is ghosted                                    #
# ----------------  CRITICAL - container is stopped                                   #
# ----------------  UNKNOWN - does not exists                                         #
#-------------------------------------------------------------------------------------#
function check_docker_container
{
	CONTAINER=$1

	RUNNING=$(docker inspect --format="{{ .State.Running }}" $CONTAINER 2> /dev/null)

	if [ $? -eq 1 ]; then
	  echo "UNKNOWN - $CONTAINER does not exist."
	  exit 3
	fi

	if [ "$RUNNING" == "false" ]; then
	  echo "CRITICAL - $CONTAINER is not running."
	  exit 2
	fi

	STARTED=$(docker inspect --format="{{ .State.StartedAt }}" $CONTAINER)
	NETWORK=$(docker inspect --format="{{ .NetworkSettings.IPAddress }}" $CONTAINER)

	echo "OK - $CONTAINER is running. IP: $NETWORK, StartedAt: $STARTED"
}
#----------------------------------------------------------------------------------------------------------#

#----------------------------------Starts the user che container-------------------------------------------#

function start
{
	if [ -d "/home/user/$1" ]; then 
	  if [ -L "/home/user/$1" ]; then
	    # It is a symlink!
	    # Symbolic link specific commands go here.
	    echo "Error, it is not a directory, it is a symlink.?"
	  else
	    # It's a directory!
	    # Directory command goes here.
	    echo "Directory already exists. That means the container belonging to $1 already exists, starting the container..."
	    docker start $1
	  fi
	else
		echo $MACHINE_IP
		echo "Attempting to create and run the container $1"
		CREATION_RESULT=$( docker run -v /var/run/docker.sock:/var/run/docker.sock -e CHE_HOST_IP=$MACHINE_IP -e CHE_DATA_FOLDER=/home/user/$1 -e CHE_PORT=$2 eclipse/che start)
		RENAME_RESULT=$(docker rename che-server $1)
		echo $CREATION_RESULT
		echo "Container successfully created"
	fi
}

#----------------------------------Stops the user che container-------------------------------------------#
function stop
{
	STOP_RESULT=$(docker exec -it $1 /bin/bash ./home/user/che/bin/che.sh stop --skip:uid || echo 'lol')
	echo $STOP_RESULT
}	

#----------------------------------------------------------------------------------------------------------#
#-----------------------------------First parameter,for now, is the name of the user-----------------------#


if [ $1 == "getIP" ]; then
	getIP

else

	if [ $# -lt  2 ]; then
		echo "Less than 2 arguments were entered"
		exit 1
	fi

	#Checks if the first paramter is specifying the user and the second is not empty
	if [ ! -z $2 ] ; then
		
		USER_NAME=$2
		PORT_NUMBER=$3
		getIP
		echo $SCRIPTS_PATH
        echo $PORT_NUMBER
		case "$1" in
			start)
				start $USER_NAME $PORT_NUMBER
				;;
			stop)
				stop $USER_NAME
				;;
            status)
                check_docker_container $USER_NAME
		esac
		
	fi
fi

