#!/bin/bash


#------------------------------------Paths used in the script-----------------------------------------------#

SCRIPTS_PATH=$(pwd)

#-----------------------------------------------------------------------------------------------------------#

#------------------------------------Obtains the IPV4 address----------------------------------------------#
function getIP
{
	MACHINE_IP=$(ip route get 1 | awk '{print $NF;exit}')
	echo $MACHINE_IP
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
		echo "Non existent"

	else
      if [ "$RUNNING" == "false" ]; then
		    echo "Not running"
	    else
		    STARTED=$(docker inspect --format="{{ .State.StartedAt }}" $CONTAINER)
		    NETWORK=$(docker inspect --format="{{ .NetworkSettings.IPAddress }}" $CONTAINER)
		    echo "Running"
	    fi
    fi
}
#----------------------------------------------------------------------------------------------------------#
#----------------------------------Creates the user che container------------------------------------------#

function create
{
	#echo "Attempting to create the container $1"
	STATUS=$( check_docker_container $1)
	if [ "$STATUS" == "Non existent" ]; then
    CREATION_RESULT=$( docker run -v /var/run/docker.sock:/var/run/docker.sock -e CHE_HOST_IP=$MACHINE_IP -e CHE_DATA_FOLDER=/home/user/$1 -e CHE_PORT=$2 codenvy/che-launcher start )
    CHECK=$(echo $CREATION_RESULT | grep -c ERROR)  #Counts the occurrences of the pattern, ERROR
    if [ $CHECK -eq 0 ]; then #If there was an error, CHECK should not be equal to 0
      RENAME_RESULT=$( docker rename che-server $1 )
      stop $1
      echo $RENAME_RESULT
    else
      echo "Container exists"
      exit 1
    fi
  else
    echo "Container existsssss"
    exit 1
  fi
}
#---------------------------------------------------------------------------------------------------------#
#----------------------------------Starts the user che container -----------------------------------------#
function start
{
  START_RESULT=$( docker start  $1)
  if [ $START_RESULT -eq $1 ]; then
    echo "Container $1 successfully started"
  else
    echo "Error $START_RESULT"
    exit 1
  fi
}

#---------------------------------------------------------------------------------------------------------#
#-----------------------------------Deletes an user che container-----------------------------------------#
function delete
{
  DELETE_RESULT=$( docker rm -f $1)
  if [ $DELETE_RESULT -eq $1 ]; then
    echo "Container $1 was successfully deleted"
  else
    echo $DELETE_RESULT
    exit 1
  fi
}
#---------------------------------------------------------------------------------------------------------#
#----------------------------------Stops the user che container-------------------------------------------#
function stop
{
  STATUS=$( check_docker_container $1 )
  if [ $STATUS == "Running" ]; then
    STOP_RESULT=$( docker exec $1 /bin/bash ./home/user/che/bin/che.sh stop --skip:uid)
    CHECK=$( echo $STOP_RESULT | grep -c Stopping)
    if [ $CHECK -eq 1 ]; then
      echo "Success"
    else
      exit 1
    fi
  else
    echo "Success"
  fi
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
		case "$1" in
		  create)
		    create $USER_NAME $PORT_NUMBER
		    ;;
			start)
				start $USER_NAME
				;;
			stop)
				stop $USER_NAME
				;;
			delete)
			  delete $USER_NAME
			  ;;
			status)
				check_docker_container $USER_NAME
				;;
		esac
	fi
fi
