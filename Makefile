.PHONY: bench 
bench:
	wrk -t20 -c200 -d 30s -s bench/post.lua http://localhost:8080/api/v1/streams/bench/data
