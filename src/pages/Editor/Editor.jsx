import React from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { useForm, useFieldArray, Controller } from "react-hook-form";

const auctionTypes = [
  { label: "Forward", value: "forward" },
  { label: "Reverse", value: "reverse" },
  { label: "Transport", value: "transport" },
];

const transportTypes = [
  { label: "Import", value: "import" },
  { label: "Export", value: "export" },
];

const transportModes = [
  { label: "Local", value: "local" },
  { label: "Air", value: "air" },
  { label: "Sea", value: "sea" },
];

const countries = [
  { label: "India", value: "India" },
  { label: "USA", value: "USA" },
  { label: "UK", value: "UK" },
];

const industries = [
  { label: "Automotive", value: "Automotive" },
  { label: "Electronics", value: "Electronics" },
  { label: "Construction", value: "Construction" },
];

const subIndustries = [
  { label: "Auto Parts", value: "Auto Parts" },
  { label: "Circuit Boards", value: "Circuit Boards" },
  { label: "Cement", value: "Cement" },
];

const Editor = () => {
  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: {
      rfq_items: [{ item_name: "", quantity: 0, unit: "", target_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rfq_items",
  });

  const watchType = watch("type");
  const watchTransportMode = watch("transport_mode");

  const onSubmit = (data) => {
    //console.log("Submitting RFQ", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <div className="grid mb-3">
        <div className="col-12 md:col-6">
          <label>RFQ Number</label>
          <InputText {...register("rfq_number")} className="w-full" />
        </div>
        <div className="col-12 md:col-6">
          <label>Title</label>
          <InputText {...register("title")} className="w-full" />
        </div>
      </div>

      <div className="grid mb-3">
        <div className="col-12 md:col-4">
          <label>Type</label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Dropdown {...field} options={auctionTypes} className="w-full" />
            )}
          />
        </div>
        <div className="col-12 md:col-4">
          <label>Status</label>
          <InputText {...register("status")} className="w-full" />
        </div>
        <div className="col-12 md:col-4">
          <label>Currency</label>
          <InputText {...register("currency")} className="w-full" />
        </div>
      </div>

      <div className="grid mb-3">
        <div className="col-12 md:col-4">
          <label>Industry</label>
          <Controller
            control={control}
            name="industry"
            render={({ field }) => (
              <Dropdown {...field} options={industries} className="w-full" />
            )}
          />
        </div>
        <div className="col-12 md:col-4">
          <label>Subindustry</label>
          <Controller
            control={control}
            name="subindustry"
            render={({ field }) => (
              <Dropdown {...field} options={subIndustries} className="w-full" />
            )}
          />
        </div>
        <div className="col-12 md:col-4">
          <label>Country</label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Dropdown {...field} options={countries} className="w-full" />
            )}
          />
        </div>
      </div>

      <div className="grid mb-3">
        <div className="col-12 md:col-6">
          <label>Open Date</label>
          <Controller
            control={control}
            name="open_date_time"
            render={({ field }) => (
              <Calendar
                {...field}
                className="w-full"
                showTime
                showIcon
                dateFormat="dd/mm/yy"
              />
            )}
          />
        </div>
        <div className="col-12 md:col-6">
          <label>Close Date</label>
          <Controller
            control={control}
            name="close_date_time"
            render={({ field }) => (
              <Calendar
                {...field}
                className="w-full"
                showTime
                showIcon
                dateFormat="dd/mm/yy"
              />
            )}
          />
        </div>
      </div>

      <div className="grid mb-3">
        <div className="col-12 md:col-6">
          <label className="mr-2">Same Bid Price Allowed</label>
          <Controller
            control={control}
            name="same_bid_price_allowed"
            render={({ field }) => (
              <Checkbox
                onChange={(e) => field.onChange(e.checked)}
                checked={field.value}
              />
            )}
          />
        </div>
        <div className="col-12 md:col-6">
          <label className="mr-2">Hide Current Bid Price</label>
          <Controller
            control={control}
            name="hide_current_bid_price"
            render={({ field }) => (
              <Checkbox
                onChange={(e) => field.onChange(e.checked)}
                checked={field.value}
              />
            )}
          />
        </div>
      </div>

      <div className="mb-4">
        <label>Description</label>
        <InputText {...register("description")} className="w-full" />
      </div>

      {/* Transport conditional UI remains unchanged here */}

      <h4 className="mt-4">Items</h4>
      {fields.map((item, index) => (
        <div key={item.id} className="grid mb-2">
          <div className="col-12 md:col-3">
            <InputText
              placeholder="Item Name"
              {...register(`rfq_items.${index}.item_name`)}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-2">
            <InputNumber
              placeholder="Qty"
              {...register(`rfq_items.${index}.quantity`)}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-2">
            <InputText
              placeholder="Unit"
              {...register(`rfq_items.${index}.unit`)}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-3">
            <InputNumber
              placeholder="Target Price"
              {...register(`rfq_items.${index}.target_price`)}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-2">
            <Button
              label="Remove"
              className="p-button-danger"
              onClick={() => remove(index)}
              type="button"
            />
          </div>
        </div>
      ))}
      <Button
        label="Add Item"
        onClick={() =>
          append({ item_name: "", quantity: 0, unit: "", target_price: 0 })
        }
        type="button"
        className="p-button-secondary mt-2"
      />

      <div className="mt-4">
        <Button
          type="submit"
          label="Submit RFQ"
          className="p-button-success w-full"
        />
      </div>
    </form>
  );
};

export default Editor;
