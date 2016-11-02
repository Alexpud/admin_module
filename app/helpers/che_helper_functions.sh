#!/bin/bash
#------------------------------------Paths used in the script-------------------------------------------------#
SCRIPTS_PATH=$(pwd)
#-------------------------------------------------------------------------------------------------------------#
#------------------------------------Obtains the IPV4 address-------------------------------------------------#
function getIP
{
	MACHINE_IP=$(ip route get 1 | awk '{print $NF;exit}')
	echo $MACHINE_IP
}
#-------------------------------------------------------------------------------------------------------------#
#-------------------------------------------------------------------------------------------------------------#
#Docker function made based on gist made by Erik Kristensen found on https://gist.github.com/ekristen/11254304#
#-------------------------------------------------------------------------------------------------------------#
# ----------------Author: Erik Kristensen                                                                     #
# ----------------Email: erik@erikkristensen.com                                                              #
# ----------------License: MIT                                                                                #
# ----------------Nagios Usage: RESULT_CHECK_nrpe!RESULT_CHECK_docker_container!_container_id_                #
# ----------------Usage: ./RESULT_CHECK_docker_container.sh _container_id_                                    #
#                                                                                                             #
# ----------------The script RESULT_CHECKs if a container is running.                                         #
# ----------------  OK - running                                                                              #
# ----------------  WARNING - container is ghosted                                                            #
# ----------------  CRITICAL - container is stopped                                                           #
# ----------------  UNKNOWN - does not exists                                                                 #
#-------------------------------------------------------------------------------------------------------------#
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
#--------------------------------------------------------------------------------------------------------------#
#----------------------------------Creates the user che container----------------------------------------------#
function create
{
	STATUS=$( check_docker_container $1 )
	if [ "$STATUS" == "Non existent" ]; then
	  MACHINE_IP=$( getIP )
	  CREATION_RESULT=$( docker run -v /var/run/docker.sock:/var/run/docker.sock -e CHE_HOST_IP=$MACHINE_IP -e CHE_DATA_FOLDER=/home/user/$1 -e CHE_PORT=$2 eclipse/che start 2>&1)
    RESULT_CHECK=$( echo $CREATION_RESULT | grep -c ERROR )
    if [ $RESULT_CHECK -eq 0 ]; then #If there was an error, RESULT_CHECK should not be equal to 0
      RENAME_RESULT=$( docker rename che-server $1 )
      stop $1
    else
      echo $CREATION_RESULT
      exit 1
    fi
  else
    echo "Error: Container already exists"
    exit 1
  fi
}
#--------------------------------------------------------------------------------------------------------------#
#---------------------------------Starts the user che container -----------------------------------------------#
function start
{
  START_RESULT=$( docker start  $1 2>&1)
  RESULT_CHECK=$( echo $START_RESULT | grep -c Error )
  if [ $RESULT_CHECK -eq 0 ]; then
    echo "Success"
  else
    echo $START_RESULT
    exit 1
  fi
}

#-------------------------------------------------------------------------------------------------------------#
#----------------------------------Deletes an user che container----------------------------------------------#
function delete
{
  DELETE_RESULT=$(docker rm -f $1 2>&1)
  RESULT_CHECK=$(echo $DELETE_RESULT | echo -c "ERROR")
  if [[ $RESULT_CHECK -eq 0 ]]; then
    echo "Success"
  else
    echo $DELETE_RESULT
    exit 1
  fi
}
#--------------------------------------------------------------------------------------------------------------#
#----------------------------------Stops the user che container------------------------------------------------#
function stop
{
  STATUS=$( check_docker_container $1 )
  if [ "$STATUS" == "Running" ]; then
    STOP_RESULT=$( docker exec $1 /bin/bash ./home/user/che/bin/che.sh stop --skip:uid 2>&1)
    RESULT_CHECK=$( echo $STOP_RESULT | grep -c Stopping )
    if [ $RESULT_CHECK -eq 1 ]; then
      echo "Success"
    else
      echo "Error: $STOP_RESULT"
      exit 1
    fi
  else
    echo "Error: $STATUS"
  fi
}
#------------------------------------------------------------------------------------------------------------#
#-------------------------------------Main program-----------------------------------------------------------#
if [ $1 == "getIP" ]; then
	getIP
else
	if [ $# -lt  2 ]; then
		echo "Error: less than 2 arguments were entered"
		exit 1
	fi
	if [ ! -z $2 ] ; then #Checks if second parameter was passed
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
	else
	  echo "Error: Second parameter is empty"
	  exit 1
	fi
fi
