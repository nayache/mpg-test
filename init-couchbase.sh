#!/bin/bash
N1QL_SCRIPT=$(cat script.n1ql)

source .env


#couchbase_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' couchbase) 
bash entrypoint.sh couchbase-server &
# Waiting couchbase container is available
sleep 2

echo "waiting for Couchbase..."
until bash -c "curl --silent http://couchbase:8091 >/dev/null"; do
    sleep 1
done

# Create cluster
couchbase-cli cluster-init -c couchbase:8091 --cluster-username="$CB_USERNAME" --cluster-password="$CB_PASSWORD" --services data,index,query --cluster-ramsize=512 --cluster-name="$CB_CLUSTER_NAME"

# Créer bucket
couchbase-cli bucket-create -c couchbase:8091 --username="$CB_USERNAME" --password="$CB_PASSWORD" --bucket="$CB_BUCKET_NAME" --bucket-type=couchbase --bucket-ramsize=128 --bucket-replica=1

# check bucket is available
while [[ "$(curl -s -o /dev/null -w '%{http_code}' -u "$CB_USERNAME":"$CB_PASSWORD" http://couchbase:8091/pools/default/buckets/$CB_BUCKET_NAME)" != "200" ]]; do
    echo "Waiting for bucket to be ready..."
    sleep 1
done

# the first request may lead to an error due to the fact that the n1ql service is not ready
# also retry query while N1QL is not ready
echo "waiting for N1QL service.."
while true; do
  output=$(cbq -e "http://couchbase:8091" -u "$CB_USERNAME" -p "$CB_PASSWORD" --script="create primary index idx_mpg_1 on mpg;")
  if [[ ! "$output" =~ ERROR ]]; then
    break
  fi
  sleep 1
done

# inject mpg datas
cbq -e "http://couchbase:8091" -u "$CB_USERNAME" -p "$CB_PASSWORD" --script="$N1QL_SCRIPT"

echo "Couchbase initialisation finish"

sleep infinity