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
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

// GetAllThreads retrieves all threads from the database
func GetAllThreads(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Query("SELECT id, title, creator, created_at FROM threads ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Failed to retrieve threads", http.StatusInternalServerError)
		log.Printf("Error querying threads: %v\n", err)
		return
	}
	defer rows.Close()

	var threads []Thread
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

	if err = rows.Err(); err != nil {
		http.Error(w, "Error iterating through threads", http.StatusInternalServerError)
		log.Printf("Error iterating rows: %v\n", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(threads)
}

// CreateThread handles the creation of a new thread
func CreateThread(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	// Handle preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body
	var newThread Thread
	if err := json.NewDecoder(r.Body).Decode(&newThread); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Printf("Error decoding request body: %v\n", err)
		return
	}

	// Validate required fields
	if newThread.Title == "" || newThread.Creator == "" {
		http.Error(w, "Title and creator are required fields", http.StatusBadRequest)
		return
	}

	// Insert the new thread into the database
	query := `
		INSERT INTO threads (title, creator) 
		VALUES ($1, $2) 
		RETURNING id, title, creator, created_at`

	err := db.QueryRow(query, newThread.Title, newThread.Creator).
		Scan(&newThread.ID, &newThread.Title, &newThread.Creator, &newThread.CreatedAt)
	
	if err != nil {
		http.Error(w, "Failed to create thread", http.StatusInternalServerError)
		log.Printf("Error creating thread: %v\n", err)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(newThread); err != nil {
		log.Printf("Error encoding response: %v\n", err)
	}
}

func main() {
	http.HandleFunc("/threads", GetAllThreads)
	http.HandleFunc("/threads/create", CreateThread)

	fmt.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}