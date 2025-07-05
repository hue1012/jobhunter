# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
# Sửa CORS - thêm port 4173 cho Vite và xử lý preflight
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000",
                   "http://localhost:4173", "http://127.0.0.1:4173"])

# Cấu hình Gemini AI - nên dùng environment variable trong production
GEMINI_API_KEY = "AIzaSyANuQpVHViKlpQBTXjgWFHl4-oKThRosUI"
genai.configure(api_key=GEMINI_API_KEY)

# Sử dụng model chính thức của Gemini
model = genai.GenerativeModel('gemini-2.0-flash')  # Đổi từ gemini-2.2-flash sang gemini-1.5-flash

    
# Hoặc thử các model khác nếu cần:
# model = genai.GenerativeModel('gemini-1.5-pro')      # Model mạnh hơn
# model = genai.GenerativeModel('gemini-1.0-pro')      # Model cũ hơn

@app.route('/api/chat', methods=['POST', 'OPTIONS'])  # Thêm OPTIONS cho preflight
def chat():
    # Xử lý preflight request của browser
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        print("=== DEBUG: API Chat được gọi ===")
        
        # Lấy tin nhắn và lịch sử từ frontend
        data = request.json
        print(f"Data nhận được: {data}")
        
        user_message = data.get('message', '')
        chat_history = data.get('history', [])
        
        print(f"User message: {user_message}")
        print(f"Chat history: {chat_history}")
        
        if not user_message:
            return jsonify({'response': 'Vui lòng nhập câu hỏi.'}), 400
        
        # Tạo system prompt cho chatbot tìm việc
        system_prompt = """Bạn là một chatbot hỗ trợ tìm việc làm thông minh và thân thiện. 
        
        Vai trò của bạn:
        - Hỗ trợ người dùng tìm kiếm cơ hội việc làm phù hợp
        - Tư vấn về CV, thư xin việc và kỹ năng phỏng vấn
        - Cung cấp thông tin về thị trường lao động và xu hướng ngành nghề
        - Gợi ý các khóa học và chứng chỉ để nâng cao kỹ năng
        - Hướng dẫn cách chuẩn bị hồ sơ xin việc chuyên nghiệp
        
        Cách trả lời:
        - Luôn thân thiện, nhiệt tình và chuyên nghiệp VÀ NGẮN GỌN
        - Đưa ra lời khuyên cụ thể và thực tế
        - Hỏi thêm thông tin nếu cần để tư vấn chính xác hơn
        - Sử dụng tiếng Việt tự nhiên và dễ hiểu
        - Khuyến khích người dùng và tạo động lực tích cực
        - Dựa vào lịch sử hội thoại để trả lời phù hợp và liên tục
        
        QUAN TRỌNG - Format câu trả lời:
        - Sử dụng xuống dòng (\n) để chia đoạn văn
        - Dùng **text** để in đậm những phần quan trọng
        - Dùng *text* để in nghiêng nhấn mạnh
        - Sử dụng dấu đầu dòng (•) hoặc số (1., 2., 3.) để liệt kê
        - Chia nhỏ thành các đoạn ngắn, dễ đọc
        - Tránh viết thành một khối văn dài
        
        Ví dụ format:
        **Chào bạn!** 👋
        
        Tôi hiểu bạn cần tư vấn về [chủ đề]. Đây là những gợi ý của tôi:
        
        **1. Bước đầu tiên:**
        • Điểm quan trọng thứ nhất
        • Điểm quan trọng thứ hai
        
        **2. Tiếp theo:**
        *Lưu ý đặc biệt này* sẽ giúp bạn...
        
        Bạn có cần tôi giải thích thêm về điểm nào không? 😊"""
        
        # Xây dựng context với lịch sử hội thoại
        conversation_context = ""
        if chat_history:
            conversation_context = "\n\nLịch sử cuộc trò chuyện gần đây:\n"
            for msg in chat_history:
                role = "Người dùng" if not msg['isBot'] else "AI Assistant"
                conversation_context += f"{role}: {msg['text']}\n"
        
        # Kết hợp system prompt, lịch sử và câu hỏi hiện tại
        full_prompt = f"{system_prompt}{conversation_context}\n\nCâu hỏi hiện tại của người dùng: {user_message}\n\nHãy trả lời dựa trên lịch sử cuộc trò chuyện và câu hỏi hiện tại:"
        
        print("Đang gọi Gemini AI...")
        # Gọi Gemini AI
        response = model.generate_content(full_prompt)
        ai_response = response.text
        print(f"Gemini AI response: {ai_response}")
        
        # Trả về kết quả
        return jsonify({'response': ai_response})
        
    except Exception as e:
        print(f"=== LỖI CHI TIẾT ===")
        print(f"Loại lỗi: {type(e).__name__}")
        print(f"Chi tiết lỗi: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({'response': f'Lỗi server: {str(e)}'}), 500

# Route để test server
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server đang hoạt động!', 'port': 5000})

if __name__ == '__main__':
    print("🚀 Flask server đang khởi động...")
    print("📡 Server sẽ chạy tại: http://127.0.0.1:5000")
    print("🔗 Test API tại: http://127.0.0.1:5000/health")
    app.run(debug=True, port=5000, host='0.0.0.0')