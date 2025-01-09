package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

// Existing Thread struct
type Thread struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Creator   string `json:"creator"`
	CreatedAt string `json:"created_at"`
}

// Message struct represents the message model
type Message struct {
    ID        int      `json:"id"`
    TextField string   `json:"text_field"`
    Username  string   `json:"username"`
    CreatedAt string   `json:"created_at"`
    Images    []string `json:"images"`
    ThreadID  int      `json:"thread_id"`
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

// Existing init function remains the same
func init() {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Unable to connect to the database: %v\n", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Unable to ping the database: %v\n", err)
	}
	log.Println("Successfully connected to the database!")
}

// Existing enableCORS function remains the same
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

func GetMessages(w http.ResponseWriter, r *http.Request) {
    enableCORS(w)

    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }

    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Get thread_id from query parameter
    threadIDStr := r.URL.Query().Get("thread_id")
    if threadIDStr == "" {
        http.Error(w, "thread_id is required", http.StatusBadRequest)
        return
    }

    threadID := 0
    if _, err := fmt.Sscanf(threadIDStr, "%d", &threadID); err != nil {
        http.Error(w, "Invalid thread_id format", http.StatusBadRequest)
        return
    }

    // Query to get all messages for a specific thread
    query := `
        SELECT id, text_field, username, created_at, 
        COALESCE(images, ARRAY[]::TEXT[]) as images, 
        thread_id 
        FROM message 
        WHERE thread_id = $1 
        ORDER BY created_at DESC`

    rows, err := db.Query(query, threadID)
    if err != nil {
        http.Error(w, "Failed to retrieve messages", http.StatusInternalServerError)
        log.Printf("Error querying messages: %v\n", err)
        return
    }
    defer rows.Close()

    var messages []Message
    for rows.Next() {
        var msg Message
        // Create a temporary interface{} to handle potential NULL values
        var images interface{}
        err := rows.Scan(
            &msg.ID,
            &msg.TextField,
            &msg.Username,
            &msg.CreatedAt,
            &images,
            &msg.ThreadID,
        )
        if err != nil {
            http.Error(w, "Failed to parse messages", http.StatusInternalServerError)
            log.Printf("Error scanning message: %v\n", err)
            return
        }

        // Handle the images array properly
        if images != nil {
            switch v := images.(type) {
            case []byte:
                // If it's a byte array, unmarshal it
                var imgArray []string
                if err := json.Unmarshal(v, &imgArray); err == nil {
                    msg.Images = imgArray
                }
            case []string:
                // If it's already a string array, use it directly
                msg.Images = v
            default:
                // Initialize empty array if images is nil or invalid
                msg.Images = []string{}
            }
        } else {
            msg.Images = []string{}
        }

        messages = append(messages, msg)
    }

    if err = rows.Err(); err != nil {
        http.Error(w, "Error iterating through messages", http.StatusInternalServerError)
        log.Printf("Error iterating rows: %v\n", err)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(messages)
}

// CreateMessage handles the creation of a new message
func CreateMessage(w http.ResponseWriter, r *http.Request) {
    enableCORS(w)

    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }

    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Parse the request body
    var newMessage Message
    if err := json.NewDecoder(r.Body).Decode(&newMessage); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        log.Printf("Error decoding request body: %v\n", err)
        return
    }

    // Validate required fields
    if newMessage.TextField == "" || newMessage.Username == "" || newMessage.ThreadID == 0 {
        http.Error(w, "text_field, username, and thread_id are required fields", http.StatusBadRequest)
        return
    }

    // Insert the new message into the database
    query := `
        INSERT INTO message (text_field, username, thread_id, images) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, text_field, username, created_at, images, thread_id`

    err := db.QueryRow(
        query,
        newMessage.TextField,
        newMessage.Username,
        newMessage.ThreadID,
        newMessage.Images,
    ).Scan(
        &newMessage.ID,
        &newMessage.TextField,
        &newMessage.Username,
        &newMessage.CreatedAt,
        &newMessage.Images,
        &newMessage.ThreadID,
    )

    if err != nil {
        http.Error(w, "Failed to create message", http.StatusInternalServerError)
        log.Printf("Error creating message: %v\n", err)
        return
    }

    // Return success response
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    if err := json.NewEncoder(w).Encode(newMessage); err != nil {
        log.Printf("Error encoding response: %v\n", err)
    }
}

func main() {
	// Existing routes
	http.HandleFunc("/threads", GetAllThreads)
	http.HandleFunc("/threads/create", CreateThread)
	http.HandleFunc("/messages", GetMessages)         
    http.HandleFunc("/messages/create", CreateMessage) 

	fmt.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}