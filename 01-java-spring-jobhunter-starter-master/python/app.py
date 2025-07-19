# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import re
import requests

app = Flask(__name__)
# Sửa CORS - thêm port 4173 cho Vite và xử lý preflight
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000",
                   "http://localhost:4173", "http://127.0.0.1:4173",
                   "http://localhost:8080", "http://127.0.0.1:8080"])

# Cấu hình Gemini AI - nên dùng environment variable trong production
GEMINI_API_KEY = "AIzaSyANuQpVHViKlpQBTXjgWFHl4-oKThRosUI"
genai.configure(api_key=GEMINI_API_KEY)

# Spring Boot backend URL
BACKEND_URL = "http://localhost:8080/api/v1"

# Test API key ngay khi khởi động
try:
    test_model = genai.GenerativeModel('gemini-2.0-flash')
    print("✅ Gemini API key hoạt động!")
except Exception as e:
    print(f"❌ Lỗi API key Gemini: {e}")
    exit(1)

# Sử dụng model chính thức của Gemini
model = genai.GenerativeModel('gemini-2.0-flash')

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
        print(f"Chat history: {len(chat_history)} messages")
        
        if not user_message:
            return jsonify({'response': 'Vui lòng nhập câu hỏi.'}), 400
        
        # BƯỚC 1: Sử dụng AI để phân tích intent và trích xuất thông tin tìm việc
        print("🔍 BƯỚC 1: Phân tích intent và trích xuất thông tin...")
        extraction_result = extract_job_criteria_with_ai(user_message, chat_history)
        print(f"Extraction result: {extraction_result}")
        
        # BƯỚC 2: Xử lý dựa trên intent
        if extraction_result.get('intent') == 'search_job':
            print("🎯 BƯỚC 2: Đây là yêu cầu tìm việc!")
            
            criteria = extraction_result.get('criteria', {})
            needs_more_info = extraction_result.get('needs_more_info', False)
            missing_fields = extraction_result.get('missing_fields', [])
            
            # Kiểm tra xem có ít nhất 1 thông tin tìm kiếm không
            has_search_info = any([
                criteria.get('skills'),
                criteria.get('location'),
                criteria.get('level'),
                criteria.get('job_title'),
                criteria.get('company')
            ])
            
            print(f"Has search info: {has_search_info}")
            print(f"Search criteria check: skills={criteria.get('skills')}, location={criteria.get('location')}, level={criteria.get('level')}, job_title={criteria.get('job_title')}, company={criteria.get('company')}")
            
            # Nếu không có thông tin nào → Hỏi thông tin cơ bản
            if not has_search_info:
                response_text = generate_initial_questions()
                return jsonify({'response': response_text})
            
            # BƯỚC 3: Query database để tìm jobs phù hợp (có ít nhất 1 thông tin)
            print("📊 BƯỚC 3: Query database tìm jobs...")
            search_criteria = {
                'skills': criteria.get('skills', []),
                'location': criteria.get('location'),
                'level': criteria.get('level'),
                'company': criteria.get('company'),
                'job_title': criteria.get('job_title')
            }
            
            # Loại bỏ các giá trị None/empty
            search_criteria = {k: v for k, v in search_criteria.items() if v}
            print(f"Search criteria: {search_criteria}")
            
            matching_jobs = query_jobs_from_backend(search_criteria)
            print(f"Found {len(matching_jobs)} matching jobs")
            print( f"Matching jobs details: {matching_jobs}")  # Hiển thị 3 job đầu tiên
            # BƯỚC 4: Hiển thị jobs dạng card + AI tư vấn
            print("🤖 BƯỚC 4: Hiển thị jobs và AI tư vấn...")
            if matching_jobs:
                # Hiển thị jobs dạng card đẹp
                # jobs_cards = format_jobs_as_cards(matching_jobs)
                
                # Tạo AI advice ngắn gọn
                formatted_jobs = format_jobs_for_ai(matching_jobs)
                ai_advice = generate_job_advice_summary(user_message, criteria, formatted_jobs, missing_fields, chat_history)
                
                # Kết hợp cards + advice
                # final_response = f"{jobs_cards}\n\n{ai_advice}"
                final_response = f"{ai_advice}"
                
            else:
                # Tư vấn khi không tìm thấy jobs với gợi ý thêm thông tin
                final_response = generate_no_jobs_advice_with_suggestions(criteria, missing_fields, chat_history)
            
            return jsonify({'response': final_response})
        
        else:
            # BƯỚC 2B: Chat bình thường (không phải tìm việc)
            print("💬 BƯỚC 2: Chat tư vấn nghề nghiệp thông thường...")
            normal_response = generate_normal_chat_response(user_message, chat_history)
            return jsonify({'response': normal_response})
        
    except Exception as e:
        print(f"=== LỖI CHI TIẾT ===")
        print(f"Loại lỗi: {type(e).__name__}")
        print(f"Chi tiết lỗi: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({'response': f'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại: {str(e)}'}), 500

# Helper functions để tương tác với backend
def query_jobs_from_backend(search_criteria):
    """
    Query jobs từ Spring Boot backend dựa trên search criteria
    """
    try:
        # Xây dựng query string từ search criteria
        query_params = []
        
        if search_criteria.get('skills'):
            skills_query = ','.join(search_criteria['skills'])
            query_params.append(f"skills.name~'{skills_query}'")
            
        if search_criteria.get('location'):
            query_params.append(f"location~'{search_criteria['location']}'")
            
        if search_criteria.get('level'):
            query_params.append(f"level~'{search_criteria['level']}'")
            
        if search_criteria.get('company'):
            query_params.append(f"company.name~'{search_criteria['company']}'")
            
        if search_criteria.get('job_title'):
            query_params.append(f"name~'{search_criteria['job_title']}'")
            
        # Thêm filter active jobs
        query_params.append("active=true")
        
        # Tạo query string
        query_string = " and ".join(query_params) if query_params else "active=true"
        
        # Gọi API backend
        url = f"{BACKEND_URL}/jobs?{query_string}&page=1&size=10&sort=createdAt,desc"
        print(f"Querying backend: {url}")
        
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get('data', {}).get('result', [])
        else:
            print(f"Backend API error: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Error querying backend: {e}")
        return []

def extract_job_criteria_with_ai(user_message, chat_history):
    """
    Sử dụng AI để trích xuất thông tin tìm kiếm việc làm từ conversation
    """
    extraction_prompt = f"""
    Bạn là một AI chuyên phân tích yêu cầu tìm việc làm. Hãy phân tích cuộc hội thoại và trích xuất thông tin tìm kiếm việc làm.

    QUAN TRỌNG: Chỉ trả về JSON hợp lệ, không có text khác.

    Lịch sử hội thoại:
    {chat_history}
    
    Tin nhắn hiện tại: {user_message}
    
    Hãy trích xuất thông tin sau và trả về JSON:
    {{
        "intent": "search_job" hoặc "chat_normal",
        "criteria": {{
            "job_title": "tên công việc hoặc vị trí (ví dụ: developer, designer, marketing)",
            "skills": ["skill1", "skill2"] - danh sách kỹ năng (React, Java, Python, etc),
            "location": "địa điểm làm việc (Hà Nội, TP.HCM, Đà Nẵng, etc)",
            "level": "INTERN/JUNIOR/MIDDLE/SENIOR",
            "company": "tên công ty nếu có",
            "salary_min": số tiền tối thiểu,
            "salary_max": số tiền tối đa
        }},
        "needs_more_info": true/false - có cần hỏi thêm thông tin không,
        "missing_fields": ["field1", "field2"] - các trường còn thiếu
    }}
    
    Lưu ý:
    - Nếu user chỉ chào hỏi, hỏi thông tin chung -> intent = "chat_normal"
    - Nếu user nói về tìm việc, ứng tuyển -> intent = "search_job"
    - Skills phổ biến: React, Vue, Angular, Java, Python, JavaScript, TypeScript, PHP, .NET, Node.js, Mobile App, iOS, Android
    - Level: INTERN (thực tập), JUNIOR (1-3 năm), MIDDLE (3-5 năm), SENIOR (>5 năm)
    - Location phổ biến: "Hà Nội", "TP.HCM", "Đà Nẵng", "Remote"
    """
    
    try:
        response = model.generate_content(
            extraction_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=800,
                top_p=0.8,
                top_k=40
            )
        )
        
        # Trích xuất JSON từ response
        response_text = response.text.strip()
        print(f"AI extraction response: {response_text}")
        
        # Tìm JSON trong response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            return json.loads(json_str)
        else:
            return {"intent": "chat_normal"}
            
    except Exception as e:
        print(f"Error in AI extraction: {e}")
        return {"intent": "chat_normal"}

def format_jobs_for_ai(jobs_list):
    """
    Format danh sách jobs để gửi cho AI tư vấn
    """
    if not jobs_list:
        return "Không tìm thấy công việc phù hợp."
    
    formatted_jobs = []
    for job in jobs_list:
        job_info = {
            "id": job.get('id'),
            "title": job.get('name'),
            "company": job.get('company', {}).get('name', 'N/A'),
            "location": job.get('location'),
            "salary": f"{job.get('salary', 0):,.0f} VND",
            "level": job.get('level'),
            "skills": [skill.get('name') for skill in job.get('skills', [])],
            "description": job.get('description', '')[:200] + "..." if len(job.get('description', '')) > 200 else job.get('description', '')
        }
        formatted_jobs.append(job_info)
    
    return formatted_jobs

def format_jobs_as_cards(jobs_list):
    """
    Format danh sách jobs thành các card đẹp mắt để hiển thị trực tiếp cho user
    Chỉ hiển thị tối đa 5 jobs
    """
    if not jobs_list:
        return "❌ **Không tìm thấy công việc phù hợp**"
    
    # Giới hạn chỉ hiển thị tối đa 5 jobs
    display_jobs = jobs_list[:5]
    total_jobs = len(jobs_list)
    
    cards = []
    for i, job in enumerate(display_jobs, 1):
        # Format skills
        skills = [skill.get('name') for skill in job.get('skills', [])]
        skills_text = ", ".join(skills[:4])  # Chỉ hiển thị tối đa 4 skills
        if len(skills) > 4:
            skills_text += f" (+{len(skills) - 4} khác)"
        
        # Format salary
        salary = job.get('salary', 0)
        salary_text = f"{salary:,.0f} VNĐ" if salary > 0 else "Thỏa thuận"
        
        # Format level với emoji
        level = job.get('level', 'N/A')
        level_emoji = {
            'INTERN': '🌱',
            'JUNIOR': '🚀', 
            'MIDDLE': '💼',
            'SENIOR': '👑'
        }.get(level, '📈')
        
        # Tạo card cho mỗi job với design đẹp hơn
        card = f"""
🏢 **{job.get('name', 'N/A')}**
🏆 {job.get('company', {}).get('name', 'N/A')}
📍 **Địa điểm:** {job.get('location', 'N/A')}
💰 **Lương:** {salary_text}
{level_emoji} **Cấp độ:** {level}
🔧 **Kỹ năng:** {skills_text if skills_text else 'Không yêu cầu cụ thể'}
"""
        cards.append(card)
    
    # Thêm header đẹp
    if total_jobs > 5:
        header = f"""🎉 **TÌM THẤY {total_jobs} CÔNG VIỆC - HIỂN THỊ TOP 5** 🎉"""
    else:
        header = f"""🎉 **TÌM THẤY {total_jobs} CÔNG VIỆC PHÙ HỢP** 🎉"""
    
    # Nối tất cả cards
    result = header + "\n".join(cards)
    
    # Thêm footer
    if total_jobs > 5:
        result += f"\n\n💡 **Còn {total_jobs - 5} công việc khác.** Bạn muốn xem thêm chi tiết vị trí nào?"
    else:
        result += f"\n\n🚀 **Sẵn sàng ứng tuyển?** Hãy chọn vị trí yêu thích và chuẩn bị CV ngay!"
    
    return result

def generate_job_advice_summary(user_message, criteria, formatted_jobs, missing_fields, chat_history):
    """
    Tạo lời tư vấn AI ngắn gọn để đi kèm với job cards
    """
    # Tạo phần gợi ý thêm thông tin (nếu có)
    suggestions = ""
    if missing_fields:
        suggestions_list = []
        for field in missing_fields:
            if field == 'skills':
                suggestions_list.append("🔧 **Kỹ năng cụ thể**")
            elif field == 'location':
                suggestions_list.append("📍 **Địa điểm mong muốn**")
            elif field == 'level':
                suggestions_list.append("📈 **Mức kinh nghiệm**")
            elif field == 'job_title':
                suggestions_list.append("💼 **Vị trí cụ thể**")
            elif field == 'company':
                suggestions_list.append("🏢 **Công ty mong muốn**")
        
        if suggestions_list:
            suggestions = f"\n\n🔍 **Để tìm kiếm chính xác hơn, hãy chia sẻ:** " + ", ".join(suggestions_list)
    
    advice_prompt = f"""
    Bạn là chuyên gia tư vấn nghề nghiệp. Danh sách công việc phù hợp đã được hiển thị ở trên.
    Hãy đưa ra lời tư vấn ngắn gọn và hữu ích.

    Yêu cầu người dùng: {user_message}
    Tiêu chí tìm kiếm: {criteria}
    list công việc ( có thể thừa): {formatted_jobs}
    
    Hãy tư vấn ngắn gọn (tối đa 800 ký tự) theo format:
    **Hiển thị** Từ các công việc hiển thị chi tiết đầy đủ thông tin các công việc thỏamãn yêu cầu từ tìm kiếm 
    **Đánh giá:** Nhận xét về các công việc tìm thấy
    **Gợi ý ứng tuyển:** 2-3 lời khuyên để ứng tuyển thành công  
    **Hành động tiếp theo:** Bước cần làm ngay
    
    Sử dụng:
    - Emoji phù hợp
    - **Text** để in đậm phần quan trọng
    - Ngôn ngữ thân thiện, tích cực
    - Đừng nhắc lại danh sách công việc (đã hiển thị ở trên)
    - Chỉ hiên thị các công việc phù hợp với tiêu chí tìm kiếm của người dùng 
    - khi hiển thị thì đánh số thứ tự từ 1,2,3... cho từng công việc để người dùng dễ theo dõi và gạch đầu dòng các mục chi tiết để dễ nhìn
    """
    
    try:
        response = model.generate_content(
            advice_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=600,
                top_p=0.8,
                top_k=40
            )
        )
        main_advice = response.text
        
        # Thêm gợi ý vào cuối nếu có
        # return main_advice + suggestions
        return main_advice
        
    except Exception as e:
        return f"""🎯 **Đánh giá:** Tìm thấy {len(formatted_jobs)} cơ hội việc làm phù hợp với yêu cầu của bạn!

💡 **Gợi ý ứng tuyển:**
• Chuẩn bị CV chuyên nghiệp phù hợp với từng vị trí
• Nghiên cứu thông tin công ty trước khi ứng tuyển
• Chuẩn bị câu trả lời cho các câu hỏi phỏng vấn thường gặp

🚀 **Hành động tiếp theo:** Chọn 2-3 vị trí phù hợp nhất và bắt đầu ứng tuyển ngay!{suggestions}"""

def generate_no_jobs_advice_with_suggestions(criteria, missing_fields, chat_history):
    """
    Tạo lời tư vấn khi không tìm thấy jobs và gợi ý thêm thông tin
    """
    # Tạo phần gợi ý thêm thông tin (nếu có)
    suggestions = ""
    if missing_fields:
        suggestions_list = []
        for field in missing_fields:
            if field == 'skills':
                suggestions_list.append("🔧 **Kỹ năng cụ thể** bạn đang có hoặc muốn phát triển")
            elif field == 'location':
                suggestions_list.append("📍 **Địa điểm** bạn sẵn sàng làm việc")
            elif field == 'level':
                suggestions_list.append("📈 **Kinh nghiệm** hiện tại của bạn")
            elif field == 'job_title':
                suggestions_list.append("💼 **Vị trí** bạn quan tâm")
            elif field == 'company':
                suggestions_list.append("🏢 **Loại công ty** bạn muốn làm việc")
        
        if suggestions_list:
            suggestions = f"\n\n🔍 **Để tìm kiếm hiệu quả hơn, hãy chia sẻ:**\n• " + "\n• ".join(suggestions_list)
    
    advice_prompt = f"""
    Bạn là chuyên gia tư vấn nghề nghiệp. Người dùng đã tìm việc với tiêu chí nhất định nhưng không tìm thấy kết quả phù hợp.

    Tiêu chí tìm kiếm hiện tại: {criteria}
    Lịch sử hội thoại: {chat_history}
    
    Hãy đưa ra lời tư vấn khuyến khích và hướng dẫn cụ thể theo format:
    1. **Thông cảm:** Thể hiện sự hiểu biết tình hình
    2. **Phân tích:** Tại sao có thể không tìm thấy việc phù hợp
    3. **Gợi ý cải thiện:** Các cách để mở rộng cơ hội
    4. **Hành động cụ thể:** Bước tiếp theo nên làm
    5. **Động viên:** Khuyến khích tích cực
    
    Sử dụng:
    - Emoji phù hợp
    - **Text** để in đậm phần quan trọng  
    - Format đẹp với xuống dòng \\n
    - Ngôn ngữ thân thiện, tích cực
    - Tối đa 1000 ký tự
    """
    
    try:
        response = model.generate_content(
            advice_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=800,
                top_p=0.8,
                top_k=40
            )
        )
        main_advice = response.text
        
        # Thêm gợi ý vào cuối nếu có
        return main_advice + suggestions
        
    except Exception as e:
        return f"""😔 **Hiện tại chưa tìm thấy công việc phù hợp với tiêu chí của bạn**

🔍 **Gợi ý cải thiện:**
• Mở rộng khu vực tìm kiếm
• Xem xét các vị trí tương tự  
• Nâng cấp kỹ năng hiện tại
• Linh hoạt hơn về mức lương

💪 **Đừng nản lòng!** Thị trường việc làm luôn có cơ hội mới. Hãy tiếp tục cố gắng!{suggestions}"""

def generate_initial_questions():
    """
    Tạo câu hỏi ban đầu khi người dùng chưa cung cấp thông tin tìm việc
    """
    return """🤖 **Chào bạn! Tôi sẽ giúp bạn tìm công việc phù hợp.**

Để tìm được những cơ hội tốt nhất, bạn có thể chia sẻ:

🔧 **Kỹ năng:** React, Java, Python, Design, Marketing...
📍 **Địa điểm:** Hà Nội, TP.HCM, Đà Nẵng, Remote...  
📈 **Kinh nghiệm:** Mới ra trường, 1-3 năm, 3-5 năm, >5 năm
💼 **Vị trí mong muốn:** Developer, Designer, Tester...
🏢 **Loại công ty:** Startup, công ty lớn, outsourcing...

💡 *Chỉ cần 1 thông tin, tôi cũng có thể tìm việc cho bạn rồi!*

Ví dụ: "Tôi biết React" hoặc "Tìm việc ở Hà Nội" """

def generate_normal_chat_response(user_message, chat_history):
    """
    Tạo response cho chat bình thường (không phải tìm việc)
    """
    system_prompt = """Bạn là một chatbot hỗ trợ tìm việc làm thông minh và thân thiện. 
    
    Vai trò của bạn:
    - Hỗ trợ người dùng tìm kiếm cơ hội việc làm phù hợp
    - Tư vấn về CV, thư xin việc và kỹ năng phỏng vấn
    - Cung cấp thông tin về thị trường lao động và xu hướng ngành nghề
    - Gợi ý các khóa học và chứng chỉ để nâng cao kỹ năng
    - Hướng dẫn cách chuẩn bị hồ sơ xin việc chuyên nghiệp
    
    Cách trả lời:
    - Luôn thân thiện, nhiệt tình và chuyên nghiệp
    - Đưa ra lời khuyên cụ thể và thực tế
    - Hỏi thêm thông tin nếu cần để tư vấn chính xác hơn
    - Sử dụng tiếng Việt tự nhiên và dễ hiểu
    - Khuyến khích người dùng và tạo động lực tích cực
    - Dựa vào lịch sử hội thoại để trả lời phù hợp và liên tục
    
    QUAN TRỌNG - Format câu trả lời:
    - Sử dụng xuống dòng (\\n) để chia đoạn văn
    - Dùng **text** để in đậm những phần quan trọng
    - Dùng *text* để in nghiêng nhấn mạnh
    - Sử dụng dấu đầu dòng (•) hoặc số (1., 2., 3.) để liệt kê
    - Chia nhỏ thành các đoạn ngắn, dễ đọc
    - Tránh viết thành một khối văn dài
    """
    
    # Xây dựng context với lịch sử hội thoại
    conversation_context = ""
    if chat_history:
        conversation_context = "\\n\\nLịch sử cuộc trò chuyện gần đây:\\n"
        for msg in chat_history:
            role = "Người dùng" if not msg.get('isBot') else "AI Assistant"
            conversation_context += f"{role}: {msg.get('text', '')}\\n"
    
    # Kết hợp system prompt, lịch sử và câu hỏi hiện tại
    full_prompt = f"{system_prompt}{conversation_context}\\n\\nCâu hỏi hiện tại của người dùng: {user_message}\\n\\nHãy trả lời dựa trên lịch sử cuộc trò chuyện và câu hỏi hiện tại:"
    
    try:
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=1000,
                top_p=0.8,
                top_k=40
            )
        )
        return response.text
    except Exception as e:
        return "Xin chào! Tôi là chatbot hỗ trợ tìm việc làm. Tôi có thể giúp bạn tìm kiếm cơ hội nghề nghiệp, tư vấn CV, và hướng dẫn phỏng vấn. Bạn cần hỗ trợ gì?"

# Route để test server
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server đang hoạt động!', 'port': 5000})

if __name__ == '__main__':
    print("🚀 Flask server đang khởi động...")
    print("📡 Server sẽ chạy tại: http://127.0.0.1:5000")
    print("🔗 Test API tại: http://127.0.0.1:5000/health")
    app.run(debug=True, port=5000, host='0.0.0.0')