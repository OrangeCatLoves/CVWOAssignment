-- Write your PostgreSQL query statement below

-- SELECT
--    request_at as Day,
--    (case when status = ('cancelled_by_driver' or 'cancelled_by_client') and  then ) as Cancellation Rate
-- FROM Trips t
-- WHERE request_at >= '2013-10-01' AND request_at <= '2013-10-03'
-- INNER JOIN Users u1 ON t.client_id = u1.users_id
-- INNER JOIN Users u2 ON t.client_id = u2.users_id
-- GROUP BY t.request_at

WITH unbanned_users AS (
    SELECT users_id
    FROM Users
    WHERE banned = 'No'
)

SELECT request_at as Day, 
ROUND(COUNT(id) FILTER (WHERE status = 'cancelled_by_driver' OR status = 'cancelled_by_client') / COUNT(id)::DECIMAL,2) AS "Cancellation Rate"
FROM Trips
WHERE client_id IN (SELECT users_id FROM unbanned_users) AND driver_id IN (SELECT users_id FROM unbanned_users) AND request_at >= '2013-10-01' AND request_at <= '2013-10-03'
GROUP BY request_at

-- Filter the Trips table to a table having rows of unbanned driver and client and the trip details falls in the correct date range
