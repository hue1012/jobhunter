package vn.javacodetest;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class JdbcConnectJobhunter {
    public static void main(String[] args) {
        // Thông tin kết nối dựa trên file cấu hình bạn đưa ra
        String url = "jdbc:mysql://localhost:3306/jobhunter";
        String username = "root";
        String password = "123456";

        Connection conn = null;

        try {
            // Nạp driver JDBC
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Tạo kết nối tới database
            conn = DriverManager.getConnection(url, username, password);

            if (conn != null) {
                System.out.println("Kết nối tới database jobhunter thành công!");
            }
        } catch (ClassNotFoundException e) {
            System.out.println("Không tìm thấy Driver JDBC!");
            e.printStackTrace();
        } catch (SQLException e) {
            System.out.println("Kết nối tới database thất bại!");
            e.printStackTrace();
        } finally {
            try {
                if (conn != null) {
                    conn.close();
                    System.out.println("Connection closed!");

                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
