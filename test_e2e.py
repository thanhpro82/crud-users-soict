import http.server
import socketserver
import threading
import time
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

PORT = 8092
DIRECTORY = os.path.abspath(".")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()

server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
time.sleep(1)

results = []

def record(name, success, message=""):
    results.append({"name": name, "success": success, "message": message})
    status = "PASSED" if success else "FAILED"
    print(f"[{status}] {name} - {message}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    
    try:
        # Test 1: Page Load & Initial Read
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_selector("#user-table-body tr", timeout=8000)
        
        rows = page.locator("#user-table-body tr").count()
        total_text = page.locator("#total-users-count").inner_text()
        
        if rows == 5 and total_text == "10":
            record("Test 1: Read Users & Render Table", True, f"Loaded {rows} rows on page 1, total {total_text} users.")
        else:
            record("Test 1: Read Users & Render Table", False, f"Expected 5 rows, 10 total. Got {rows} rows, total {total_text}.")
        
        page.screenshot(path="test_screenshot_1_initial.png")

        # Test 2: Search by Name
        search_input = page.locator("#search-input")
        search_input.fill("Clementine")
        page.wait_for_timeout(300)
        
        filtered_rows = page.locator("#user-table-body tr").count()
        row_text = page.locator("#user-table-body tr").first.inner_text()
        
        if "Clementine" in row_text and filtered_rows == 1:
            record("Test 2: Search Users by Name", True, f"Found {filtered_rows} match for 'Clementine'.")
        else:
            record("Test 2: Search Users by Name", False, f"Expected 1 match, got {filtered_rows}.")
            
        page.screenshot(path="test_screenshot_2_search.png")
        
        # Clear search
        page.locator("#btn-clear-search").click()
        page.wait_for_timeout(300)

        # Test 3: Pagination
        page.locator(".page-btn:has-text('2')").click()
        page.wait_for_timeout(300)
        page2_info = page.locator("#pagination-info").inner_text()
        if "6 - 10" in page2_info:
            record("Test 3: Pagination Controls", True, f"Navigated to page 2: '{page2_info}'.")
        else:
            record("Test 3: Pagination Controls", False, f"Page info mismatch: '{page2_info}'.")
            
        # Back to page 1
        page.locator(".page-btn:has-text('1')").click()
        page.wait_for_timeout(300)

        # Test 4: Create User (POST)
        page.locator("#btn-open-create-modal").click()
        page.wait_for_selector("#user-modal:not(.hidden)")
        
        page.locator("#form-name").fill("Nguyễn Tuấn Thành")
        page.locator("#form-email").fill("tuanthanh@soict.hust.edu.vn")
        page.locator("#form-phone").fill("0988776655")
        
        page.screenshot(path="test_screenshot_3_create_modal.png")
        page.locator("#btn-submit-form").click()
        
        # Wait for toast and table update
        page.wait_for_selector(".toast-success", timeout=5000)
        page.wait_for_timeout(500)
        
        first_row_name = page.locator("#user-table-body tr td strong").first.inner_text()
        new_total = page.locator("#total-users-count").inner_text()
        
        if "Nguyễn Tuấn Thành" in first_row_name and new_total == "11":
            record("Test 4: Create User (POST) & UI Update", True, f"User added at top. Total is now {new_total}.")
        else:
            record("Test 4: Create User (POST) & UI Update", False, f"Expected 'Nguyễn Tuấn Thành' at top, got '{first_row_name}'. Total: {new_total}.")

        # Test 5: Update User (PUT)
        # Edit user row 2 (which is user #1)
        edit_btn = page.locator("#user-table-body tr").nth(1).locator(".btn-edit")
        edit_btn.click()
        page.wait_for_selector("#user-modal:not(.hidden)")
        
        page.locator("#form-name").fill("Leanne Graham Updated")
        page.locator("#btn-submit-form").click()
        
        # Wait for modal to close and updated text in table
        page.wait_for_selector("#user-modal", state="hidden", timeout=6000)
        page.wait_for_selector("#user-table-body:has-text('Leanne Graham Updated')", timeout=6000)
        
        updated_row_text = page.locator("#user-table-body tr").nth(1).inner_text()
        if "Leanne Graham Updated" in updated_row_text:
            record("Test 5: Update User (PUT) & UI Update", True, "User updated in table instantly.")
        else:
            record("Test 5: Update User (PUT) & UI Update", False, f"Row text: {updated_row_text}")

        # Test 6: Delete User (DELETE)
        # Delete first user
        page.locator("#user-table-body tr").first.locator(".btn-delete").click()
        page.wait_for_selector("#delete-modal:not(.hidden)")
        page.screenshot(path="test_screenshot_4_delete_modal.png")
        
        page.locator("#btn-confirm-delete").click()
        page.wait_for_selector("#delete-modal", state="hidden", timeout=6000)
        page.wait_for_selector("#user-table-body:not(:has-text('Nguyễn Tuấn Thành'))", timeout=6000)
        
        after_delete_total = page.locator("#total-users-count").inner_text()
        first_row_after = page.locator("#user-table-body tr td strong").first.inner_text()
        
        if after_delete_total == "10" and "Nguyễn Tuấn Thành" not in first_row_after:
            record("Test 6: Delete User (DELETE) & UI Update", True, f"User deleted. Total: {after_delete_total}.")
        else:
            record("Test 6: Delete User (DELETE) & UI Update", False, f"First row: '{first_row_after}', Total: {after_delete_total}")

        page.screenshot(path="test_screenshot_5_final.png")

    except Exception as e:
        record("Test Execution", False, f"Exception occurred: {str(e)}")
        page.screenshot(path="test_screenshot_error.png")
    finally:
        browser.close()

# Print summary
all_passed = all(r["success"] for r in results)
print("\n" + "="*50)
print(f"SUMMARY: {'ALL TESTS PASSED!' if all_passed else 'SOME TESTS FAILED!'}")
print(f"Passed: {sum(1 for r in results if r['success'])} / {len(results)}")
print("="*50)

if not all_passed:
    sys.exit(1)
