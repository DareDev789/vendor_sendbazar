import MultiLocalisation from "./MultiLocalisation";

export default function Page() {
  const handleLocalisationChange = (newList) => {
    console.log("Localisations mises à jour :", newList);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <MultiLocalisation
        autresLocalisations={[
          {
            dokan_geo_address: "Antananarivo, Madagascar",
            dokan_geo_latitude: "-18.8792",
            dokan_geo_longitude: "47.5079",
          },
        ]}
        onChange={handleLocalisationChange}
      />
    </div>
  );
}
