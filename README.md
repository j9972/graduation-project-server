# graduation-project-server
😊여행 스케줄 추천해주는 웹사이트 - 서버

여행가자
저희는 여행을 가기전에 어디 지역을 갈지를 정하고 그 지역에 어떤 숙소가 있는지? 어떤 여행 장소가 있는지? 등에 대해서 고민을 합니다.
이를 위해 방문할 장소들을 확인하고 장소간 거리를 체크하기 위해 네이버 지도와 같은 지도 사이트를 자주 사용합니다.

하지만, 네이버 지도와 같은 지도 사이트는 하나의 거리와 하나의 거리를 비교해주고 중간에 경유지 정도를 보여줍니다
이는 마커들을 비교하고 새로운 마커를 추가해 다시 마커를 비교해야하는 번거로움이 있었습니다.

이를 개선해 지도를 보면서 직관적으로 장소들을 확인 해줄 수 있도록 하였고, 추가적으로 추천 기능, 검색 기능등의 부가적인 기능을 더 추가하였습니다

- 네이버 클라우드 플랫폼, 공공데이터 사용, open weather api, 네이버 맵 api 사용
- 방문자 수를 체크하기 위한 IP 사용
- Mysql & sequelize 를 사용해 sql query 문 없이 데이터 베이스 처리 & N : M 관계 사용
- Redis를 Cache의 개념으로 사용해 request에 대한 response 속도 향상
- Express의 다양한 모듈을 통해 이메일 형식 체크 등의 다양한 방법 사용
- node - mailer 를 사용해 이메일 인증
- .env , token을 사용한 보안 강화
- accessToken, refreshToken을 통한 JWT 매커니즘 사용 ( Expires를 두어 refresh 를 통한 accessToken 재발급 )
- accessToken에 관한 middelware사용으로 authorization 활용
