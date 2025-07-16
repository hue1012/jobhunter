import { IJob } from '@/types/backend';
import { convertSlug, getLocationName } from '@/config/utils';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Row, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface IProps {
    jobs: IJob[];
    isLoading?: boolean;
}

const CompanyJobList = (props: IProps) => {
    const { jobs, isLoading = false } = props;
    const navigate = useNavigate();

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles["company-jobs-section"]}>
            <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>
                Việc làm đang tuyển ({jobs.length})
            </h3>
            
            {jobs && jobs.length > 0 ? (
                <Row gutter={[20, 20]}>
                    {jobs.map(item => (
                        <Col span={24} key={item.id}>
                            <Card 
                                size="small" 
                                hoverable
                                onClick={() => handleViewDetailJob(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className={styles["card-job-content"]}>
                                    <div className={styles["card-job-left"]}>
                                        <img
                                            alt="company logo"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className={styles["card-job-right"]}>
                                        <div className={styles["job-title"]} style={{ 
                                            fontSize: '16px', 
                                            fontWeight: 'bold',
                                            marginBottom: '8px'
                                        }}>
                                            {item.name}
                                        </div>
                                        <div className={styles["job-location"]} style={{ marginBottom: '4px' }}>
                                            <EnvironmentOutlined style={{ color: '#58aaab' }} />
                                            &nbsp;{getLocationName(item.location)}
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <ThunderboltOutlined style={{ color: 'orange' }} />
                                            &nbsp;{(item.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            {item.skills?.map((skill, index) => (
                                                <Tag key={index} color="blue" style={{ marginRight: '4px' }}>
                                                    {skill.name}
                                                </Tag>
                                            ))}
                                        </div>
                                        <div className={styles["job-updatedAt"]} style={{ 
                                            color: '#666', 
                                            fontSize: '12px' 
                                        }}>
                                            {item.updatedAt ? dayjs(item.updatedAt).locale('en').fromNow() : dayjs(item.createdAt).locale('en').fromNow()}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="Công ty chưa có việc làm nào đang tuyển dụng" />
            )}
        </div>
    );
};

export default CompanyJobList;
