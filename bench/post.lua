counter = 0

wrk.method = "POST"
wrk.headers["Content-Type"] = "application/json"

request = function()
  body = "{\"foo\": " .. counter .. "}"
  counter = counter + 1
  return wrk.format(nil, nil, nil, body)
end
