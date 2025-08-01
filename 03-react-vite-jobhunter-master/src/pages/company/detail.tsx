import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany, IJob } from "@/types/backend";
import { callFetchCompanyById, callFetchJobsByCompanyId } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import CompanyJobList from "@/components/client/card/company.job.list";


const ClientCompanyDetailPage = (props: any) => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [companyJobs, setCompanyJobs] = useState<IJob[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // company id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true);
                const res = await callFetchCompanyById(id);
                if (res?.data) {
                    setCompanyDetail(res.data);
                }
                setIsLoading(false);
            }
        };
        init();
    }, [id]);

    useEffect(() => {
        const fetchJobs = async () => {
            if (id) {
                setIsLoadingJobs(true);
                const res = await callFetchJobsByCompanyId(id, 'page=1&size=10');
                if (res?.data) {
                    setCompanyJobs(res.data.result);
                }
                setIsLoadingJobs(false);
            }
        };
        fetchJobs();
    }, [id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {companyDetail && companyDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {companyDetail.name}
                                </div>

                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{(companyDetail?.address)}
                                </div>

                                <Divider />
                                {parse(companyDetail?.description ?? "")}
                                
                                <Divider />
                                <CompanyJobList jobs={companyJobs} isLoading={isLoadingJobs} />
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div>
                                        <img
                                            width={200}
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${companyDetail?.logo}`}
                                        />
                                    </div>
                                    <div>
                                        {companyDetail?.name}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
        </div>
    )
}
export default ClientCompanyDetailPage;