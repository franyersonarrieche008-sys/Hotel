from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReservaCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    nombre_huesped: str = Field(min_length=1, max_length=120)
    numero_habitacion: int = Field(gt=0)
    noches: int = Field(gt=0)
    confirmada: bool = False


class ReservaUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    nombre_huesped: str | None = Field(default=None, min_length=1, max_length=120)
    numero_habitacion: int | None = Field(default=None, gt=0)
    noches: int | None = Field(default=None, gt=0)
    confirmada: bool | None = None

    @model_validator(mode="after")
    def reject_explicit_nulls(self):
        for field_name in self.model_fields_set:
            if getattr(self, field_name) is None:
                raise ValueError(f"{field_name} no puede ser nulo.")
        return self


class ReservaResponse(ReservaCreate):
    id: str
