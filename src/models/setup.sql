CREATE TABLE organization (
	organization_id SERIAL PRIMARY KEY,
	name VARCHAR(150) NOT NULL,
	description TEXT NOT NULL,
	contact_email VARCHAR(255) NOT NULL,
	logo_filename VARCHAR(255) NOT NULL
);

INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES 
	('BrightFuture Builders', 'A nonprofit focused on improving community infrastructure through sustainable construction projects.', 'info@brightfuturebuilders.org', 'brightfuture-logo.png'),
	('GreenHarvest Growers', 'An urban farming collective promoting food sustainability and education in local neighborhoods.', 'contact@greenharvest.org', 'greenharvest-logo.png'),
	('UnityServe Volunteers', 'A volunteer coordination group supporting local charities and service initiatives.', 'hello@unityserve.org', 'unityserve-logo.png');


CREATE TABLE service_project (
	project_id SERIAL PRIMARY KEY,
	organization_id INT NOT NULL,
	title VARCHAR(100) NOT NULL,
	description TEXT ,
	location VARCHAR(100) NOT NULL,
	date DATE NOT NULL,
	CONSTRAINT fk_organization
		FOREIGN KEY (organization_id)
		REFERENCES organization(organization_id)
);

INSERT INTO service_project
( organization_id, title, description, location ,date)
VALUES
-- BrightFuture Builders (1)
(1, 'Community Park Renovation', 'Renovation of playground equipment and walking paths in the local community park.', 'San Jose', '2026-04-15'),
(1, 'Affordable Housing Repair', 'Volunteers assist with basic home repairs for low-income families.', 'Alajuela', '2026-05-10'),
(1, 'School Classroom Upgrade', 'Upgrading desks, lighting, and painting classrooms in a rural school.', 'Cartago', '2026-06-05'),
(1, 'Community Bridge Construction', 'Building a small pedestrian bridge for safer access to the village.', 'Heredia', '2026-07-20'),
(1, 'Disaster Relief Housing Support', 'Constructing temporary shelters after seasonal flooding.', 'Limon', '2026-08-12'),

-- GreenHarvest Growers (2)
(2, 'Urban Garden Installation', 'Creating a community garden to promote local food production.', 'San Jose', '2026-04-22'),
(2, 'School Gardening Workshop', 'Teaching students how to grow vegetables sustainably.', 'Alajuela', '2026-05-18'),
(2, 'Neighborhood Compost Program', 'Launching a composting initiative to reduce food waste.', 'Heredia', '2026-06-14'),
(2, 'Community Tree Planting', 'Planting fruit trees in public spaces to support urban agriculture.', 'Cartago', '2026-07-08'),
(2, 'Farmers Market Support', 'Helping local farmers organize and manage a weekly farmers market.', 'San Jose', '2026-08-03'),

-- UnityServe Volunteers (3)
(3, 'Food Bank Distribution', 'Volunteers distribute food packages to families in need.', 'San Jose', '2026-04-12'),
(3, 'Clothing Donation Drive', 'Collecting and distributing clothing for homeless shelters.', 'Alajuela', '2026-05-07'),
(3, 'Community Cleanup Day', 'Volunteers clean parks and public areas in the neighborhood.', 'Heredia', '2026-06-11'),
(3, 'Senior Center Assistance', 'Providing companionship and help with activities for elderly residents.', 'Cartago', '2026-07-02'),
(3, 'Back-to-School Supply Drive', 'Distributing school supplies to children from low-income families.', 'Limon', '2026-08-15');


CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE project_categories (
    project_id INT REFERENCES service_projects(project_id),
    category_id INT REFERENCES categories(category_id),
    PRIMARY KEY (project_id, category_id)
);

INSERT INTO categories (name) VALUES
('Education'),
('Environment'),
('Community Service');

INSERT INTO project_categories (project_id, category_id) VALUES
(1,3),
(2,3),
(3,3),
(4,3),
(5,2),
(6,1),
(7,1),
(8,1),
(9,2),
(10,3),
(11,3),
(12,3),
(13,2),
(14,3),
(15,3);