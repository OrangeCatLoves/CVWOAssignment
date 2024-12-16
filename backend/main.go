package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

// Thread represents the structure of a thread record in the database
type Thread struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Creator   string `json:"creator"`
	CreatedAt string `json:"created_at"`
}

// Database connection details
const (
	host     = "localhost"
	port     = 5433
	user     = "postgres"
	password = "ramenKing55"
	dbname   = "threads"
)

var db *sql.DB

func init() {
	// Connect to the PostgreSQL database
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Unable to connect to the database: %v\n", err)
	}

	// Verify the connection
	err = db.Ping()
	if err != nil {
		log.Fatalf("Unable to ping the database: %v\n", err)
	}
	log.Println("Successfully connected to the database!")
}

// Middleware to enable CORS
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")                // Allow all origins
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT") // Allowed HTTP methods
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")   // Allowed headers
}

// GetAllThreads retrieves all threads from the database
func GetAllThreads(w http.ResponseWriter, r *http.Request) {
	enableCORS(w) // Add CORS headers

	// Query the threads table
	rows, err := db.Query("SELECT id, title, creator, created_at FROM threads")
	if err != nil {
		http.Error(w, "Failed to retrieve threads", http.StatusInternalServerError)
		log.Printf("Error querying threads: %v\n", err)
		return
	}
	defer rows.Close()

	// Slice to hold the thread records
	var threads []Thread

	// Iterate through the result set and append each thread to the slice
	for rows.Next() {
		var thread Thread
		err := rows.Scan(&thread.ID, &thread.Title, &thread.Creator, &thread.CreatedAt)
		if err != nil {
			http.Error(w, "Failed to parse threads", http.StatusInternalServerError)
			log.Printf("Error scanning thread: %v\n", err)
			return
		}
		threads = append(threads, thread)
	}

	// Check for errors after iterating through rows
	if err = rows.Err(); err != nil {
		http.Error(w, "Error iterating through threads", http.StatusInternalServerError)
		log.Printf("Error iterating rows: %v\n", err)
		return
	}

	// Set the content type to JSON and encode the threads slice
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(threads)
}

func main() {
	// Define routes
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w) // Add CORS headers
		fmt.Fprintln(w, "Welcome to the Home Page!")
	})
	http.HandleFunc("/threads", GetAllThreads) // Define the endpoint for retrieving threads

	// Start the server
	fmt.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
